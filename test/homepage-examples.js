var assert = require('assert');

var prettyCron = require('../');

suite('homepage examples', function() {
  suite('human-readable output', function() {

    [
      { cron: '0 * * * *', readable: 'Every hour, on the hour' },
      { cron: '30 * * * 1', readable: 'Every 30th minute past every hour on Monday' },
      { cron: '15,45 9,21 * * *', readable: '09:15, 09:45, 21:15 and 21:45 every day' },
      { cron: '18,19 7 5 * *', readable: '07:18 and 07:19 on the 5th of every month' },
      { cron: '* * 25 12 *', readable: 'Every minute on the 25th in Dec' },
      { cron: '0 * 1,3 * *', readable: 'Every hour, on the hour on the 1 and 3rd of every month' },
      { cron: '0 17 * 1,4,7,10 *', readable: '17:00 every day every 3 months' },
      { cron: '15 * * * 1,2', readable: 'Every 15th minute past every hour on Monday and Tuesday' },
      { cron: '* 8,10,12,14,16,18,20 * * *', readable: 'Every minute of 8, 10, 12, 14, 16, 18 and 20th hour' },
      { cron: '0 12 15,16 1 3', readable: '12:00 on the 15 and 16th and every Wednesday in Jan' },
      { cron: '0 4,8,12,4 * * 4,5,6', readable: 'Every 0th minute past the 4, 8 and 12th hour on Thursday, Friday and Saturday' },
      { cron: '0 2,16 1,8,15,22 * 1,2', readable: '02:00 and 16:00 on the 1, 8, 15 and 22nd of every month and every Monday and Tuesday' },
      { cron: '15 3,8,10,12,14,16,18 16 * *', readable: 'Every 15th minute past the 3, 8, 10, 12, 14, 16 and 18th hour on the 16th of every month' },
      { cron: '2 8,10,12,14,16,18 * 8 0,3', readable: 'Every 2nd minute past the 8, 10, 12, 14, 16 and 18th hour on Sunday and Wednesday in Aug' },
      { cron: '* * * * WED', readable: 'Every minute on Wednesday' },
      { cron: '0 16 * 2 WED#2', readable: '16:00 on the 2nd Wednesday in Feb' },
    ].forEach(function(item) {
      test(item.cron, function() {
        var readable_output = prettyCron.toString(item.cron);
        assert.equal(readable_output, item.readable);
      });
    });

  });
});
