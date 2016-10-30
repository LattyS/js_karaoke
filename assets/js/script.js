window.onload = function() {

    /* Player creation */

    var audioplayer = document.createElement("audio");
    audioplayer.controls = false;
    audioplayer.autoplay = false;
    audioplayer.muted = false;

    /* Music choice */

    var sourceMP3 = document.createElement("source");
    sourceMP3.type = "audio/mpeg";

    var musicChoice;
    var txtContent;

    $('td').click(function() {
        musicChoice = this.id;
        sourceMP3.src = "assets/music/"+ musicChoice +".mp3";
        audioplayer.load();

        /* Reading txt */

        $.get("assets/lyrics/"+ musicChoice +".txt", function (data) {
            txtContent = data;
            lyricsAvailable();
        });

        $('table, h2').fadeOut(500);
        $('.karaoke, h3').delay(500).fadeIn(500);
    });

    audioplayer.appendChild(sourceMP3);

    /* Sound effects plugin */

    $('td').easyAudioEffects({
        mp3 : "http://www.soundjay.com/switch/sounds/switch-22a.mp3",
        eventType : "hover"
    });

    $('td').easyAudioEffects({
        mp3 : "http://www.soundjay.com/communication/sounds/cassette-player-button-3.mp3",
        eventType : "click"
    });

    $('h3').easyAudioEffects({
        mp3 : "http://www.soundjay.com/communication/sounds/cassette-eject-1.mp3",
        eventType : "click"
    });

    /* Controls */

    var audioPlayPause = document.getElementsByClassName("audio-play-pause")[0];
    var soundOnOff = document.getElementsByClassName("sound-on-off")[0];

    var play = document.createElement("img");
    play.src = "assets/img/icons/play.png";
    play.style.display = "block";
    play.setAttribute("class","playpause");

    var pause = document.createElement("img");
    pause.src = "assets/img/icons/pause.png";
    pause.style.display = "none";
    pause.setAttribute("class","playpause");

    var soundOn = document.createElement("img");
    soundOn.src = "assets/img/icons/sound_on.png";
    soundOn.style.display = "block";
    soundOn.setAttribute("class","sound");

    var soundOff = document.createElement("img");
    soundOff.src = "assets/img/icons/sound_off.png";
    soundOff.style.display = "none";
    soundOff.setAttribute("class","sound");

    audioPlayPause.appendChild(play);
    audioPlayPause.appendChild(pause);
    soundOnOff.appendChild(soundOn);
    soundOnOff.appendChild(soundOff);

    audioPlayPause.onclick = function(){
        if (audioplayer.paused) {
            audioplayer.play();
            pause.style.display = "block";
            play.style.display = "none";
        } else {
            audioplayer.pause();
            pause.style.display = "none";
            play.style.display = "block";
        }
    };

    soundOnOff.onclick = function(){volume()};
    soundOnOff.onvolumechange = function(){volume()};

    function volume() {
        if (audioplayer.volume == 0) {
            audioplayer.volume = 1;
            soundOn.style.display = "block";
            soundOff.style.display = "none";
        } else {
            audioplayer.volume = 0;
            soundOn.style.display = "none";
            soundOff.style.display = "block";
        }
    }

    $('h3').click(function() {
        $('h3, .karaoke').fadeOut(500);
        $('table, h2').delay(500).fadeIn(500);
        audioplayer.pause();
        audioplayer.volume = 1;
        audioplayer.currentTime = 0.0;
        play.style.display = "block";
        pause.style.display = "none";
        soundOn.style.display = "block";
        soundOff.style.display = "none";
        $('.lyrics-container').html("");
    });

    /* Audio duration calc */

    var audioDuration = "";
    audioplayer.addEventListener("loadeddata", function () {
        audioDuration = audioplayer.duration;
    });

    function lyricsAvailable() {

        var lines = txtContent.split(/\n/);

        /* Separate lyrics form duration */

        var arrayLyrics = [];

        for (var line in lines) {
            var lyrics = lines[line].substring(10);
            arrayLyrics.push(lyrics);
        }

        /* Convert to second */

        var regex = /\[(.*?)\]/g;
        var res = txtContent.match(regex);
        var arraySeconds = [];

        for (var i in res) {
            var toconvert = res[i].slice(1, -1);
            var parts = toconvert.split(/[:.\s]/),
                minutes = +parts[0],
                seconds = +parts[1];
            var conversion = (minutes * 60 + seconds).toFixed(2);
            arraySeconds.push(conversion);
        }

        function combineArrays(key, value) {
            var array = [];
            for (var i = 0; i < key.length; i++)
                array[key[i]] = value[i];
            return array;
        }

        var arraySync = combineArrays(arraySeconds, arrayLyrics);
        console.log(arraySync);

        /* Sync lyrics with currentTime */

        audioplayer.ontimeupdate = function () {syncing()};

        function syncing() {
            var audioCurrentTime = audioplayer.currentTime;
            for (var i in arraySync) {
                if (audioCurrentTime > i) {
                    $('.lyrics-container').html(arraySync[i]);
                }
            }

            /* Custom timeline */

            $('.range').stop(true, true).animate({
                'width': (audioCurrentTime + .25) / audioDuration * 100 + '%'
            }, 250, 'linear');
        }

        $('.timeline').click(function(e) {
            var pc = e.offsetX / $(this).width();
            audioplayer.currentTime = audioDuration * pc;
        })

    }
};