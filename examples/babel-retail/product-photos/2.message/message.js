'use strict';

var aws = require('aws-sdk'); // eslint-disable-line import/no-unresolved, import/no-extraneous-dependencies
var SES = new aws.SES();
var lambda = new aws.Lambda();
/**
 * AWS
 */


var constants = {
  // internal
  ERROR_SERVER: 'Server Error',
  // module and method names
  MODULE: 'message.js',
  METHOD_HANDLER: 'handler',
  METHOD_ENSURE_TWILIO_INITIALIZED: 'ensureAuthTokenDecrypted',
  METHOD_SEND_MESSAGE: 'sendMessage',
  // external
  /**
   * Errors
   */

};
/**
 * Utility Methods (Internal)
 */

var impl = {
  /**
   * Send a message, generated by the given event, to the assigned photographer
   * @param event The event containing the photographer assignment
   */
  sendMessage: function sendMessage(event, callback) {
    var params = {
      Destination: {
        ToAddresses: [event.photographer.email]
      },
      Message: {
        Body: {
          Text: {
            Data: ["Hello ".concat(event.photographer.name, "!"), 'Please snap a pic of:', "  ".concat(event.data.name), 'Created by:', "  ".concat(event.merchantName)].join('\n').trim()
          }
        }
      }
    };

    return SES.sendEmail(params, callback);
  } // Example event:
  // {
  //   schema: 'com.nordstrom/retail-stream/1-0-0',
  //   origin: 'hello-retail/product-producer-automation',
  //   timeOrigin: '2017-01-12T18:29:25.171Z',
  //   data: {
  //     schema: 'com.nordstrom/product/create/1-0-0',
  //     id: 4579874,
  //     brand: 'POLO RALPH LAUREN',
  //     name: 'Polo Ralph Lauren 3-Pack Socks',
  //     description: 'PAGE:/s/polo-ralph-lauren-3-pack-socks/4579874',
  //     category: 'Socks for Men',
  //   },
  //   photographers: ['Erik'],
  //   photographer: {
  //     name: 'Erik',
  //     phone: '+<num>',
  //   },
  // }
  // Example Message Create Success Response:
  // {
  //   sid: '<mid>',
  //   date_created: 'Tue, 14 Feb 2017 01:32:57 +0000',
  //   date_updated: 'Tue, 14 Feb 2017 01:32:57 +0000',
  //   date_sent: null,
  //   account_sid: '<sid>',
  //   to: '+<to_num>',
  //   from: '+<from_num>',
  //   messaging_service_sid: null,
  //   body: 'Hello ${photographer.name}!\\nPlease snap a pic of:\\n Polo Ralph Lauren 3-Pack Socks',
  //   status: 'queued',
  //   num_segments: '1',
  //   num_media: '0',
  //   direction: 'outbound-api',
  //   api_version: '2010-04-01',
  //   price: null,
  //   price_unit: 'USD',
  //   error_code: null,
  //   error_message: null,
  //   uri: '/2010-04-01/Accounts/<sid>/Messages/<mid>.json',
  //   subresource_uris: {
  //     media: '/2010-04-01/Accounts/<sid>/Messages/<mid>/Media.json',
  //   },
  //   dateCreated: '2017-02-14T01:32:57.000Z',
  //   dateUpdated: '2017-02-14T01:32:57.000Z',
  //   dateSent: null,
  //   accountSid: '<sid>',
  //   messagingServiceSid: null,
  //   numSegments: '1',
  //   numMedia: '0',
  //   apiVersion: '2010-04-01',
  //   priceUnit: 'USD',
  //   errorCode: null,
  //   errorMessage: null,
  //   subresourceUris: {
  //     media: '/2010-04-01/Accounts/<sid>/Messages/<mid>/Media.json',
  //   },
  // }
  // Example Error Response:
  // {
  //   Error: 'HandledError',
  //   Cause: {
  //     errorMessage: {
  //       status: 400,
  //       message: 'The From phone number <from_num> is not a valid, SMS-capable inbound phone number or short code for your account.',
  //       code: 21606,
  //       moreInfo: 'https://www.twilio.com/docs/errors/21606'
  //     },
  //   },
  // }

};
module.exports = {
  handler: function handler(event, context, callback) {
    // console.log(JSON.stringify(event, null, 2));
    impl.sendMessage(event, function (response, err) {
      // console.log("Success: ".concat(JSON.stringify(message, null, 2)));
      callback(null, event);

      if (err) {
        var params = {
          FunctionName: 'product-photos-fail-dev-fail',
          InvocationType: "RequestResponse",
          Payload:  JSON.stringify(err)
        };
        lambda.invoke(params, function(r) {
          callback(r)
        });
      }
    });
  }
};

module.exports.handler({
  photographer: {email: TAJS_make('AnyStr'), name: TAJS_make('AnyStr')},
  data: { name: TAJS_make('AnyStr')},
  merchantName: TAJS_make('AnyStr')
}, null, function () {});
