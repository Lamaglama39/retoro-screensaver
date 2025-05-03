const logo = document.getElementById('dvd-logo');
const speedInput = document.getElementById('speed');
const sizeInput = document.getElementById('size');
const textInput = document.getElementById('text');
const textGroup = document.getElementById('text-group');
const imageGroup = document.getElementById('image-group');
const imageUpload = document.getElementById('image-upload');
const removeImageBtn = document.getElementById('remove-image');
const applyTextBtn = document.getElementById('apply-text');
const colorChangeToggle = document.getElementById('color-change');
const settings = document.getElementById('settings');
const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
let x = 0;
let y = 0;
let dx = 2;
let dy = 2;
let currentColor = 0;
let isFullscreen = false;
let isImageMode = true; // デフォルトで画像モード
let currentSize = 5; // デフォルトサイズ
let logoImg = null; // DVDロゴ画像要素への参照
let changeColorOnBounce = true; // 反射時の色変更フラグ

function updatePosition() {
    const maxX = window.innerWidth - logo.offsetWidth;
    const maxY = window.innerHeight - logo.offsetHeight;

    // 位置の更新前に境界チェック
    if (x + dx <= 0) {
        x = 0;
        dx = -dx;
        if (changeColorOnBounce) {
            changeColor();
        }
    } else if (x + dx >= maxX) {
        x = maxX;
        dx = -dx;
        if (changeColorOnBounce) {
            changeColor();
        }
    } else {
        x += dx;
    }

    if (y + dy <= 0) {
        y = 0;
        dy = -dy;
        if (changeColorOnBounce) {
            changeColor();
        }
    } else if (y + dy >= maxY) {
        y = maxY;
        dy = -dy;
        if (changeColorOnBounce) {
            changeColor();
        }
    } else {
        y += dy;
    }

    logo.style.left = `${x}px`;
    logo.style.top = `${y}px`;

    requestAnimationFrame(updatePosition);
}

function changeColor() {
    // 反射するたびにランダムな色に変更
    const randomColor = getRandomColor();
    
    if (isImageMode && logoImg) {
        // 画像の色を変更（フィルター効果を使用）
        applyColorFilter(logoImg, randomColor);
        // ボックス背景は透明に
        logo.style.backgroundColor = 'transparent';
    } else {
        // テキストモードの場合は背景色を変更
        logo.style.backgroundColor = randomColor;
    }
}

// ランダムな色を生成する関数
function getRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

// 画像に色フィルターを適用する関数
function applyColorFilter(img, color) {
    // 16進カラーコードをRGB値に変換
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    
    // 画像に色フィルターを適用
    img.style.filter = `brightness(0) saturate(100%) invert(1) sepia(1) saturate(10000%) hue-rotate(${getHueRotate(r, g, b)}deg)`;
}

// RGB値から色相回転角度を計算
function getHueRotate(r, g, b) {
    // RGB値からHSL値を計算
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h;
    
    if (max === min) {
        h = 0;
    } else if (max === r) {
        h = 60 * (0 + (g - b) / (max - min));
    } else if (max === g) {
        h = 60 * (2 + (b - r) / (max - min));
    } else {
        h = 60 * (4 + (r - g) / (max - min));
    }
    
    if (h < 0) h += 360;
    
    return h;
}

function adjustPosition() {
    const maxX = window.innerWidth - logo.offsetWidth;
    const maxY = window.innerHeight - logo.offsetHeight;
    
    // 画面外に出ていたら位置を調整
    if (x < 0) x = 0;
    if (x > maxX) x = maxX;
    if (y < 0) y = 0;
    if (y > maxY) y = maxY;
    
    logo.style.left = `${x}px`;
    logo.style.top = `${y}px`;
}

function updateSpeed(newSpeed) {
    // 現在の進行方向を保持
    const currentDxSign = Math.sign(dx);
    const currentDySign = Math.sign(dy);
    
    // 新しい速度を設定（方向は保持）
    dx = newSpeed * currentDxSign;
    dy = newSpeed * currentDySign;
    
    adjustPosition();
}

function toggleFullscreen() {
    if (!isFullscreen) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    isFullscreen = !isFullscreen;
    
    // 全画面表示状態に応じて設定グループの表示/非表示を切り替え
    const settingGroups = document.querySelectorAll('.setting-group');
    settingGroups.forEach(group => {
        group.style.display = isFullscreen ? 'none' : 'block';
    });
    
    // 設定メニュー全体の表示/非表示を切り替え
    settings.style.display = isFullscreen ? 'none' : 'block';
    
    // 全画面切り替え後に位置を調整
    setTimeout(() => {
        adjustPosition();
        // 色を維持
        if (!isImageMode) {
            // テキストモードの場合は背景色を維持
            const randomColor = getRandomColor();
            logo.style.backgroundColor = randomColor;
        }
    }, 100);
}

function updateSize(size) {
    currentSize = size;
    
    if (isImageMode) {
        // 画像モードの場合はボックスサイズを直接変更
        const baseSize = 10; // 基準となるビューポートの割合（%）
        const sizePercentage = baseSize * (size / 5); // 5が基準値（50%）、1は10%、10は100%
        logo.style.width = `calc(${sizePercentage}vw + 20px)`;
    } else {
        // テキストモードの場合はフォントサイズを変更し、ボックスサイズは自動
        const baseFontSize = 20; // 基準フォントサイズ (px)
        const fontSize = baseFontSize * (size / 5); // スケーリング
        logo.style.width = 'auto';
        logo.style.fontSize = `${fontSize}px`;
    }
    
    // 位置調整
    adjustPosition();
}

// 速度設定の更新
speedInput.addEventListener('input', (e) => {
    const speed = parseInt(e.target.value);
    updateSpeed(speed);
});

// サイズ設定の更新
sizeInput.addEventListener('input', (e) => {
    const size = parseInt(e.target.value);
    updateSize(size);
});

// 色変更トグルの更新
colorChangeToggle.addEventListener('change', (e) => {
    changeColorOnBounce = e.target.checked;
    
    // トグルスイッチの状態ラベルを更新
    const statusLabel = document.getElementById('color-change-status');
    if (statusLabel) {
        statusLabel.textContent = changeColorOnBounce ? 'オン' : 'オフ';
    }
});

// テキスト適用ボタン
applyTextBtn.addEventListener('click', () => {
    if (isImageMode) {
        // 画像モードの場合はテキストモードに切り替え
        isImageMode = false;
        textGroup.style.display = 'block';
        
        // DVDロゴをテキストに置き換え
        while (logo.firstChild) {
            logo.removeChild(logo.firstChild);
        }
        
        const h1 = document.createElement('h1');
        h1.textContent = textInput.value;
        logo.appendChild(h1);
        
        // ロゴ画像の参照をクリア
        logoImg = null;
        
        // テキストモードでは背景色を設定
        const randomColor = getRandomColor();
        logo.style.backgroundColor = randomColor;
        logo.style.padding = '10px 20px';
        
        // 現在のサイズを適用
        updateSize(currentSize);
        
        // 位置調整
        adjustPosition();
    } else {
        // すでにテキストモードの場合は、テキストだけ更新
        if (logo.querySelector('h1')) {
            logo.querySelector('h1').textContent = textInput.value;
            // サイズ調整（フォントサイズのみ変更、ボックスは自動調整）
            updateSize(currentSize);
        }
    }
});

// テキストの更新（入力中の即時反映はオフにし、ボタンクリック時のみ適用）
textInput.addEventListener('keypress', (e) => {
    // Enterキーでも適用
    if (e.key === 'Enter') {
        applyTextBtn.click();
    }
});

// ウィンドウサイズ変更時の位置調整
window.addEventListener('resize', adjustPosition);

// クリックで全画面切り替え（メニュー範囲外のみ）
document.addEventListener('click', (e) => {
    // メニュー範囲内のクリックは無視
    if (!settings.contains(e.target)) {
        toggleFullscreen();
    }
});

// 初期位置の設定
x = Math.random() * (window.innerWidth - logo.offsetWidth);
y = Math.random() * (window.innerHeight - logo.offsetHeight);

// アニメーション開始
updatePosition(); 

// フルスクリーン変更イベントを監視
document.addEventListener('fullscreenchange', updateSettingGroupsVisibility);
document.addEventListener('webkitfullscreenchange', updateSettingGroupsVisibility);
document.addEventListener('mozfullscreenchange', updateSettingGroupsVisibility);
document.addEventListener('MSFullscreenChange', updateSettingGroupsVisibility);

// 設定グループの表示状態を更新する関数
function updateSettingGroupsVisibility() {
    const isCurrentlyFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                                     document.mozFullScreenElement || document.msFullscreenElement);
    
    const settingGroups = document.querySelectorAll('.setting-group');
    settingGroups.forEach(group => {
        group.style.display = isCurrentlyFullscreen ? 'none' : 'block';
    });
    
    // 画像モードの場合はテキスト入力を非表示
    if (isImageMode && !isCurrentlyFullscreen) {
        textGroup.style.display = 'none';
    }
    
    // 設定メニュー全体の表示/非表示を切り替え
    settings.style.display = isCurrentlyFullscreen ? 'none' : 'block';
    
    // isFullscreen 状態変数を更新
    isFullscreen = isCurrentlyFullscreen;
    
    // 色を維持
    if (!isImageMode) {
        // テキストモードの場合は背景色を維持
        const randomColor = getRandomColor();
        logo.style.backgroundColor = randomColor;
    }
    
    // 位置を調整
    adjustPosition();
}

// 初期化処理: DVDロゴを設定
function initializeWithDefaultLogo() {
    // テキストモードを無効化
    isImageMode = true;
    textGroup.style.display = 'none';
    
    // DVDロゴの内容を画像に置き換え
    while (logo.firstChild) {
        logo.removeChild(logo.firstChild);
    }
    
    const img = document.createElement('img');
    img.src = '/dvd-logo.png';
    img.onerror = function() {
        // 画像が読み込めない場合はテキストモードに戻す
        isImageMode = false;
        textGroup.style.display = 'block';
        
        const h1 = document.createElement('h1');
        h1.textContent = textInput.value;
        logo.appendChild(h1);
        
        const randomColor = getRandomColor();
        logo.style.backgroundColor = randomColor;
        logo.style.padding = '10px 20px';
    };
    img.style.display = 'block';
    
    // 画像要素への参照を保存
    logoImg = img;
    
    logo.appendChild(img);
    logo.style.backgroundColor = 'transparent';
    logo.style.padding = '0';
    
    // 初期色をランダムに設定
    if (changeColorOnBounce) {
        const initialColor = getRandomColor();
        applyColorFilter(img, initialColor);
    }
    
    // 現在のサイズを適用
    updateSize(currentSize);
}

// 画像アップロード処理
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // テキストモードを無効化
            isImageMode = true;
            textGroup.style.display = 'none';
            
            // DVDロゴの内容を画像に置き換え
            while (logo.firstChild) {
                logo.removeChild(logo.firstChild);
            }
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.display = 'block';
            
            // 画像要素への参照を保存
            logoImg = img;
            
            logo.appendChild(img);
            logo.style.backgroundColor = 'transparent';
            logo.style.padding = '0';
            
            // 初期色をランダムに設定
            if (changeColorOnBounce) {
                const initialColor = getRandomColor();
                applyColorFilter(img, initialColor);
            }
            
            // 現在のサイズを適用
            updateSize(currentSize);
            
            // 位置調整
            adjustPosition();
        };
        
        reader.readAsDataURL(file);
    }
});

// 画像削除処理
removeImageBtn.addEventListener('click', () => {
    // テキストモードに戻す
    isImageMode = false;
    textGroup.style.display = 'block';
    
    // DVDロゴをテキストに戻す
    while (logo.firstChild) {
        logo.removeChild(logo.firstChild);
    }
    
    const h1 = document.createElement('h1');
    h1.textContent = textInput.value;
    logo.appendChild(h1);
    
    // ロゴ画像の参照をクリア
    logoImg = null;
    
    // テキストモードでは背景色を設定
    const randomColor = getRandomColor();
    logo.style.backgroundColor = randomColor;
    logo.style.padding = '10px 20px';
    
    // 現在のサイズを適用
    updateSize(currentSize);
    
    // 位置調整
    adjustPosition();
});

// 初期化時にサイズを設定
updateSize(currentSize);

// 選択を防止する
document.addEventListener('selectstart', function(e) {
    // 設定メニュー内の入力フィールドは選択可能にする
    if (!settings.contains(e.target)) {
        e.preventDefault();
    }
});

// ドラッグを防止する
document.addEventListener('dragstart', function(e) {
    e.preventDefault();
});

// 右クリックコンテキストメニューを防止する
document.addEventListener('contextmenu', function(e) {
    // 設定メニュー内は右クリックを許可する
    if (!settings.contains(e.target)) {
        e.preventDefault();
    }
});

// ページロード時に初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeWithDefaultLogo();
}); 