const logo = document.getElementById('dvd-logo');
const speedInput = document.getElementById('speed');
const sizeInput = document.getElementById('size');
const textInput = document.getElementById('text');
const textGroup = document.getElementById('text-group');
const imageGroup = document.getElementById('image-group');
const imageUpload = document.getElementById('image-upload');
const removeImageBtn = document.getElementById('remove-image');
const settings = document.getElementById('settings');
const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
let x = 0;
let y = 0;
let dx = 2;
let dy = 2;
let currentColor = 0;
let isFullscreen = false;
let isImageMode = false;
let currentSize = 5; // デフォルトサイズ

function updatePosition() {
    const maxX = window.innerWidth - logo.offsetWidth;
    const maxY = window.innerHeight - logo.offsetHeight;

    // 位置の更新前に境界チェック
    if (x + dx <= 0) {
        x = 0;
        dx = -dx;
        changeColor();
    } else if (x + dx >= maxX) {
        x = maxX;
        dx = -dx;
        changeColor();
    } else {
        x += dx;
    }

    if (y + dy <= 0) {
        y = 0;
        dy = -dy;
        changeColor();
    } else if (y + dy >= maxY) {
        y = maxY;
        dy = -dy;
        changeColor();
    } else {
        y += dy;
    }

    logo.style.left = `${x}px`;
    logo.style.top = `${y}px`;

    requestAnimationFrame(updatePosition);
}

function changeColor() {
    if (!isImageMode) {
        currentColor = (currentColor + 1) % colors.length;
        logo.style.backgroundColor = colors[currentColor];
    }
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
        // ロゴの色を維持する
        logo.style.backgroundColor = colors[currentColor];
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

// テキストの更新
textInput.addEventListener('input', (e) => {
    if (logo.querySelector('h1')) {
        logo.querySelector('h1').textContent = e.target.value;
        // サイズ調整（フォントサイズのみ変更、ボックスは自動調整）
        updateSize(currentSize);
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
    
    // ロゴの色を維持する
    if (!isImageMode) {
        logo.style.backgroundColor = colors[currentColor];
    }
    
    // 位置を調整
    adjustPosition();
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
            
            logo.appendChild(img);
            logo.style.backgroundColor = 'transparent';
            logo.style.padding = '0';
            
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
    
    logo.style.backgroundColor = colors[currentColor];
    logo.style.padding = '10px 20px';
    
    // 現在のサイズを適用
    updateSize(currentSize);
    
    // 位置調整
    adjustPosition();
});

// 初期化時にサイズを設定
updateSize(currentSize); 