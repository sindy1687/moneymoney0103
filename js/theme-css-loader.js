/* 主題 CSS 按需載入：只載入目前主題的檔案（原本 85 個主題檔每次全部載入，手機很慢）。
 * 對照表由各主題檔實際鎖定的 data-theme 產生；一律載入的共用檔在 index.html（styles.css、
 * css/styles-themes.css、css/theme-shared-keyframes.css…）。
 * 新增主題 CSS 檔時，要在這裡加上對照，並在 css/themes/ 放檔案。 */
(function () {
    'use strict';
    var THEME_CSS_FILES = {
        "amberRonin": ["css/themes/amberRonin.css"],
        "anyaMelody": ["css/themes/anyaMelody.css"],
        "aurora": ["css/themes/aurora.css"],
        "auroraflow": ["css/themes/auroraflow.css"],
        "autumnBunny": ["css/themes/autumnBunny.css"],
        "blackCatCoinGalaxy": ["css/themes/blackCatCoinGalaxy.css"],
        "blackGoldFrog": ["css/themes/blackGoldFrog.css"],
        "blossomSwirl": ["css/themes/blossomSwirl.css"],
        "blue": ["css/themes/blue.css"],
        "blueBunnyFlower": ["css/themes/blueBunnyFlower.css"],
        "blueLotusGoldGlow": ["css/themes/blueLotusGoldGlow.css"],
        "capybaraSakuraPond": ["css/themes/capybaraSakuraPond.css"],
        "citrusNoirBlossom": ["css/themes/citrusNoirBlossom.css"],
        "coinCatGold": ["css/themes/coinCatGold.css"],
        "cozyWood": ["css/themes/cozyWood.css"],
        "crystalFortune": ["css/themes/crystalFortune.css"],
        "cute": ["css/themes/cute.css"],
        "cutePastel": ["cute-pastel-theme.css"],
        "cutecreatures": ["css/themes/cutecreatures.css"],
        "cyan": ["css/themes/cyan.css"],
        "cyber": ["css/themes/cyber.css"],
        "cyberpunkCity": ["cyberpunk-city-theme.css"],
        "demonslayer": ["css/themes/demonslayer.css"],
        "dreamy-peach": ["dreamy-peach-theme.css"],
        "dreamyGalaxy": ["dreamy-galaxy-theme.css"],
        "emerald": ["emerald-dream-theme.css"],
        "emeraldPrince": ["flame-theme.css"],
        "festive": ["festive-theme.css"],
        "firefly": ["css/themes/firefly.css"],
        "flame": ["flame-theme.css"],
        "floralGradient": ["css/themes/floralGradient.css"],
        "forest": ["css/themes/forest.css"],
        "fortuneGodGetRich": ["css/themes/fortuneGodGetRich.css"],
        "galaxy": ["css/themes/galaxy.css"],
        "ganeshaGoldOm": ["css/themes/ganeshaGoldOm.css"],
        "green": ["css/themes/green.css"],
        "hanfuElegance": ["css/themes/hanfuElegance.css"],
        "hanfuMaskNoir": ["css/themes/hanfuMaskNoir.css"],
        "hardworkMoney": ["css/themes/hardworkMoney.css"],
        "indigo": ["css/themes/indigo.css"],
        "jellyParty": ["css/themes/jellyParty.css"],
        "kitsuneElegance": ["css/themes/kitsuneElegance.css"],
        "leafCatGreen": ["css/themes/leafCatGreen.css"],
        "lilyCatPond": ["css/themes/capybaraSakuraPond.css"],
        "littlePrince": ["little-prince-theme.css"],
        "littlePrinceWhaleNight": ["css/themes/littlePrinceWhaleNight.css"],
        "luckyCatPink": ["css/themes/luckyCatPink.css"],
        "mandalaNoirBloom": ["css/themes/mandalaNoirBloom.css"],
        "meteor": ["css/themes/meteor.css"],
        "midnight": ["css/themes/midnight.css"],
        "mintBunnyTea": ["css/themes/autumnBunny.css"],
        "narutoGraffiti": ["css/themes/narutoGraffiti.css"],
        "neon": ["css/themes/neon.css"],
        "noface": ["css/themes/noface.css"],
        "ocean": ["css/themes/ocean.css"],
        "oceanWhale": ["css/themes/oceanWhale.css"],
        "orange": ["css/themes/orange.css"],
        "pastelBlossomMist": ["css/themes/pastelBlossomMist.css"],
        "pastelCatDream": ["css/themes/pastelCatDream.css"],
        "pastelStarryEyes": ["css/themes/pastelStarryEyes.css"],
        "peach": ["css/themes/peach.css"],
        "piggyMelody": ["css/themes/piggyMelody.css"],
        "piggyMirrorRoom": ["css/themes/piggyMirrorRoom.css"],
        "pikachuSnow": ["css/themes/pikachuSnow.css"],
        "pink": ["css/themes/pink.css"],
        "purple": ["css/themes/purple.css"],
        "red": ["css/themes/red.css"],
        "samoyedSnowWave": ["css/themes/samoyedSnowWave.css"],
        "serpentEyes": ["css/themes/serpentEyes.css"],
        "shibaPastel": ["css/themes/shibaPastel.css"],
        "shinchan": ["shinchan-theme.css"],
        "shinchanFlashlightNight": ["css/themes/shinchanFlashlightNight.css"],
        "shinchanSakura": ["css/themes/shinchanSakura.css"],
        "shinobu": ["css/themes/shinobu.css"],
        "snow": ["css/themes/snow.css"],
        "soft-lavender": ["soft-lavender-theme.css"],
        "spacegold": ["css/themes/shinobu.css"],
        "star": ["css/themes/star.css"],
        "starWhaleButterfly": ["css/themes/starWhaleButterfly.css"],
        "starry-blue-purple": ["starry-blue-purple-theme.css"],
        "teal": ["css/themes/teal.css"],
        "totoro": ["css/themes/totoro.css"],
        "totoroCitrusPool": ["css/themes/totoroCitrusPool.css"],
        "waterBlade": ["css/themes/waterBlade.css"],
        "waveRonin": ["css/themes/waveRonin.css"],
        "whimsicalStarry": ["whimsical-starry-theme.css"],
        "yellow": ["css/themes/yellow.css"]
    };

    // 插入位置維持原本的載入順序：根目錄的 *-theme.css 原本緊接在 styles.css 之後（slot a），
    // css/themes/*.css 原本由 css/styles-themes.css 匯入（slot b）。readability-fixes.css 仍在最後。
    function slotFor(file) {
        return document.querySelector(file.indexOf('css/themes/') === 0 ? 'meta[name="theme-css-slot-b"]' : 'meta[name="theme-css-slot-a"]');
    }

    function loadThemeCss(themeId) {
        var files = THEME_CSS_FILES[themeId] || [];
        var wanted = {};
        files.forEach(function (f) { wanted[f] = true; });
        Array.prototype.forEach.call(document.querySelectorAll('link[data-theme-css]'), function (link) {
            if (!wanted[link.getAttribute('data-theme-css')]) link.parentNode.removeChild(link);
        });
        return Promise.all(files.map(function (file) {
            var existing = document.querySelector('link[data-theme-css="' + file + '"]');
            if (existing) return Promise.resolve();
            var slot = slotFor(file);
            if (!slot) return Promise.resolve();
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = file;
            link.setAttribute('data-theme-css', file);
            var done = new Promise(function (resolve) { link.onload = link.onerror = function () { resolve(); }; });
            slot.parentNode.insertBefore(link, slot);
            return done;
        }));
    }

    window.THEME_CSS_FILES = THEME_CSS_FILES;
    window.loadThemeCss = loadThemeCss;
})();
