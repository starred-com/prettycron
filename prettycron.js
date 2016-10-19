////////////////////////////////////////////////////////////////////////////////////
//
//  prettycron.js
//  Generates human-readable sentences from a schedule string in cron format
//
//  Based on an earlier version by Pehr Johansson
//  http://dsysadm.blogspot.com.au/2012/09/human-readable-cron-expressions-using.html
//
////////////////////////////////////////////////////////////////////////////////////
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU Lesser General Public License as published
//  by the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU Lesser General Public License for more details.
//
//  You should have received a copy of the GNU Lesser General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.
////////////////////////////////////////////////////////////////////////////////////

if ((!moment || !later) && (typeof require !== 'undefined')) {
  var moment = require('moment');
  require('moment/locale/nl');
  var later = require('later');
}

(function() {

  /*
   * For an array of numbers, e.g. a list of hours in a schedule,
   * return a string listing out all of the values (complete with
   * "and" plus ordinal text on the last item).
   */
  var numberList = function(numbers) {
    moment.locale(constants.languageCode);
    if (numbers.length < 2) {
      return moment()._locale.ordinal(numbers);
    }

    var last_val = numbers.pop();
    return numbers.join(', ') + ' ' + constants.prettyCronAnd + ' ' + moment()._locale.ordinal(last_val);
  };

  /*
   * Parse a number into day of week, or a month name;
   * used in dateList below.
   */
  var numberToDateName = function(value, type) {
    if (type == 'dow') {
      return moment().day(value - 1).format('dddd');
    } else if (type == 'mon') {
      return moment().month(value - 1).format('MMM');
    }
  };

  /*
   * From an array of numbers corresponding to dates (given in type: either
   * days of the week, or months), return a string listing all the values.
   */
  var dateList = function(numbers, type) {
    if (numbers.length < 2) {
      return numberToDateName(''+numbers[0], type);
    }

    var last_val = '' + numbers.pop();
    var output_text = '';

    for (var i=0, value; value=numbers[i]; i++) {
      if (output_text.length > 0) {
        output_text += ', ';
      }
      output_text += numberToDateName(value, type);
    }
    return output_text + ' ' + constants.prettyCronAnd + ' ' + numberToDateName(last_val, type);
  };

  /*
   * Pad to equivalent of sprintf('%02d'). Both moment.js and later.js
   * have zero-fill functions, but alas, they're private.
   */
  var zeroPad = function(x) {
    return (x < 10) ? '0' + x : x;
  };

  //----------------

  /*
   * Given a schedule from later.js (i.e. after parsing the cronspec),
   * generate a friendly sentence description.
   */
  var scheduleToSentence = function(schedule) {
    moment.locale(constants.languageCode);
    var output_text = '';

    if (schedule['D']) { // runs only on specific day(s) of month
      if(schedule['D'].length < 31 && schedule['D'].length > 7){
        output_text += constants.prettyCronEvery + ' ' + Math.round( 31 / schedule['D'].length) + ' ' + constants.prettyCronDays;
      }
      else if(schedule['D'].length == 31){
        output_text += constants.prettyCronEveryday;
      }
      else {
        output_text += constants.prettyCronOnThe + ' ' + numberList(schedule['D']);
      }
      if (!schedule['M']) {
        output_text += ' ' + constants.prettyCronEveryMonth;
      }
    }

    if (schedule['d']) { // runs only on specific day(s) of week
      if (schedule['D']) {
        // if both day fields are specified, cron uses both; superuser.com/a/348372
        output_text += ' ' + constants.prettyCronAndEvery + ' ';
      } else {
        output_text += constants.prettyCronOn + ' ';
      }
      // set dow count
      if (schedule['dc']) {
        output_text += constants.prettyCronThe + ' ' + moment()._locale.ordinal(schedule['dc'][0]) + ' ';
      }
      output_text += dateList(schedule['d'], 'dow');
      if (!schedule['M']) {
        output_text += ' ' + constants.prettyCronEveryMonth;
      }      
    }

    if (schedule['M']) {
      // runs only in specific months; put this output last
      if(schedule['M'].length < 12 && schedule['M'].length >= 4){
          output_text += ' ' + constants.prettyCronEvery +' ' + Math.round(12 / schedule['M'].length) + ' ' + constants.prettyCronMonths;
      }
      else if(schedule['M'].length == 12){
        output_text += ' ' + constants.prettyCronEveryMonth;
      }
      else {
          output_text += ' ' + constants.prettyCronIn + ' ' + dateList(schedule['M'], 'mon');
      }
    }

    if (!schedule['d'] && !schedule['D']) {
      output_text += constants.prettyCronEveryDay;
      if (!schedule['M']) {
        output_text += ' ' + constants.prettyCronEveryMonth;
      }
    }
    
    if (schedule['h'] && schedule['m'] && schedule['h'].length <= 2 && schedule['m'].length <= 2) {
      // If there are only one or two specified values for
      // hour or minute, print them in HH:MM format

      var hm = [];
      for (var i=0; i < schedule['h'].length; i++) {
        for (var j=0; j < schedule['m'].length; j++) {
          hm.push(zeroPad(schedule['h'][i]) + ':' + zeroPad(schedule['m'][j]));
        }
      }
      if (hm.length < 2) {
        output_text += ' ' + constants.prettyCronAt + ' ' + hm[0];
      } else {
        var last_val = hm.pop();
        output_text += ' ' + constants.prettyCronAt + ' ' + hm.join(', ') + ' ' + constants.prettyCronAnd + ' ' + last_val;
      }

    }

    return output_text;
  };

  //----------------

  /*
   * Given a cronspec, return the human-readable string.
   */
  var toString = function(cronspec, sixth) {
    var schedule = later.parse.cron(cronspec, sixth);
    return scheduleToSentence(schedule['schedules'][0]);
  };

  /*
   * Given a cronspec, return the next date for when it will next run.
   * (This is just a wrapper for later.js)
   */
  var getNextDate = function(cronspec, sixth) {
    var schedule = later.parse.cron(cronspec, sixth);
    return later.schedule(schedule).next();
  };

  /*
   * Given a cronspec, return a friendly string for when it will next run.
   * (This is just a wrapper for later.js and moment.js)
   */
  var getNext = function(cronspec, sixth) {
    return moment( getNextDate( cronspec, sixth ) ).calendar();
  };

  //----------------

  // attach ourselves to window in the browser, and to exports in Node,
  // so our functions can always be called as prettyCron.toString()
  var global_obj = (typeof exports !== "undefined" && exports !== null) ? exports : window.prettyCron = {};

  global_obj.toString = toString;
  global_obj.getNext = getNext;
  global_obj.getNextDate = getNextDate;

}).call(this);