(function() {
    'use strict';

    angular
        .module('app.videochat', [])
        .controller('VideoChatController', VideoChatController);

    VideoChatController.$inject = ['$scope', '$log', 'tokenService'];

    function VideoChatController($scope, $log) {
        var vm = this;
        var token;
        var identity;
        var conversationsClient;
        var activeConversation;
        vm.previewMedia;
        vm.clientConnected = false;
        vm.remoteParticipants = {};

        function getToken() {
            return tokenservice.getToken()
                .then(function(data) {
                    token = data.token;
                    identity = data.identity;
                    return token;
                });
        }

        activate();

        function activate() {
            return getToken().then(function(token) {
                var accessManager = new Twilio.AccessManager(token);

                conversationsClient = new Twilio.Conversations.Client(accessManager);

            });
        }

        return getToken().then(function(token) {
            var accessManager = new Twilio.AccessManager(token);

            conversationsClient = new Twilio.Conversations.Client(accessManager);
            conversationsClient.listen().then(function() {
                $log.log('Connected to Twilio. Listening for incoming Invites as "'
                    conversationsClient.identity '"');

                conversationsClient.on('invite', function(invite) {
                    $log.log('Incoming invite from: '
                        invite.from);
                    invite.accept();
                });
            }).catch(function(error) {
                $log.log('Could not connect to Twilio: '
                    error.message);
            });
        });

        function conversationStarted(conversation) {

        }

        vm.conversationStarted = function(conversation) {
            activeConversation = conversation;
            if (!vm.previewMedia) {
                $scope.$apply(function() {
                    vm.previewMedia = conversation.localMedia;
                });
            }
            conversation.on('participantConnected', function(participant) {
                $scope.$apply(function() {
                    $log.log('Participant "' + participant.identity + '" connected');
                    vm.remoteParticipants[participant.sid] = participant.media;
                });
            });
        }
        invite.accept().then(conversationStarted);

        vm.previewMedia = new Twilio.Conversations.LocalMedia();
        Twilio.Conversations.getLocalMedia().then(function(mediaStream) {
            $scope.$apply(function() {
                vm.previewMedia.addStream(mediaStream);
            });
        }).catch(function(error) {
            $log.error('Unable to access local media', error);
        });
    };
    vm.previewMedia;
})();
