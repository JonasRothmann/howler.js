(function(){"use strict";HowlerGlobal.prototype.addConvolver=function(convolverName,impulseResponse,callback){var self=this;if(!self.ctx||!self.ctx.listener){return self}if(!self._convolvers){self._convolvers={}}if(self._convolvers[convolverName]){console.warn("A convolver already exists under this name.");return self}var xhr=new XMLHttpRequest;if(!impulseResponse){console.log("Could not find IR at supplied path");return}xhr.open("GET",impulseResponse,true);xhr.responseType="arraybuffer";xhr.onreadystatechange=function(){if(xhr.readyState===4){if(xhr.status<300&&xhr.status>199||xhr.status===302){Howler.ctx.decodeAudioData(xhr.response,function(buffer){var convolver=Howler.ctx.createConvolver();convolver.connect(Howler.masterGain);convolver.buffer=buffer;self._convolvers[convolverName]=convolver;if(callback){callback()}},function(e){if(e)console.log("Error decoding IR audio data"+e)})}}};xhr.send();return self};Howl.prototype.init=function(_super){return function(o){var self=this;self._convolverVolume=o.convolverVolume||1;return _super.call(this,o)}}(Howl.prototype.init);Howl.prototype.sendToConvolver=function(convolverName,sendLevel,id){var self=this;if(!self._webAudio){return self}if(!(self._state==="loaded"&&Howler._convolvers[convolverName])){self._queue.push({event:"sendToConvolver",action:function(){self.sendToConvolver(convolverName,sendLevel)}});return self}var ids=self._getSoundIds(id);for(var i=0;i<ids.length;i++){var sound=self._soundById(ids[i]);if(sound){if(!sound._convolverSend){setupConvolverSend(sound)}sound._convolverSend.connect(Howler._convolvers[convolverName]);sound._convolverSend.gain.setValueAtTime(sendLevel,Howler.ctx.currentTime)}}return self};Howl.prototype.removeFromConvolver=function(id){var self=this;if(!self._webAudio){return self}if(self._state!=="loaded"){self._queue.push({event:"removeFromConvolver",action:function(){self.removeFromConvolver()}});return self}var ids=self._getSoundIds(id);for(var i=0;i<ids.length;i++){var sound=self._soundById(ids[i]);if(sound){if(sound._convolverSend){removeConvolverSend(sound)}}}return self};Howl.prototype.convolverVolume=function(sendLevel,id){var self=this;var args=arguments;if(!self._webAudio){return self}if(typeof id==="undefined"){if(typeof sendLevel==="number"){self._convolverVolume=sendLevel}}if(sendLevel===undefined){return self._convolverVolume}if(sendLevel>=0&&sendLevel<=1){if(self._state!=="loaded"){self._queue.push({event:"setConvolverSendLevel",action:function(){self.convolverVolume(sendLevel)}});return self}var ids=self._getSoundIds(id);for(var i=0;i<ids.length;i++){var sound=self._soundById(ids[i]);if(sound){if(sound._convolverSend&&!sound._muted){sound._convolverSend.gain.setValueAtTime(sendLevel,Howler.ctx.currentTime)}}}}return self};Sound.prototype.init=function(_super){return function(){var self=this;var parent=self._parent;self._convolverVolume=parent._convolverVolume;_super.call(this)}}(Sound.prototype.init);Sound.prototype.reset=function(_super){return function(){var self=this;var parent=self._parent;self._convolverVolume=parent._convolverVolume;return _super.call(this)}}(Sound.prototype.reset);var setupConvolverSend=function(sound){sound._convolverSend=Howler.ctx.createGain();sound._convolverSend.gain.value=1;sound._fxSend.connect(sound._convolverSend);if(!sound._paused){sound._parent.pause(sound._id,true).play(sound._id)}};var removeConvolverSend=function(sound){sound._convolverSend.disconnect(0);if(!sound._paused){sound._parent.pause(sound._id,true).play(sound._id)}}})();