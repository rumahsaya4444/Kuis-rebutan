import React, { useState } from 'react';
import { FileCode2, Copy, Check, Download, Server, Database, Settings, BookOpen, X } from 'lucide-react';

interface PhpExportModalProps {
  onClose: () => void;
}

export const PhpExportModal: React.FC<PhpExportModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'server' | 'sql' | 'leaderboard' | 'nginx' | 'guide'>('server');
  const [copied, setCopied] = useState(false);

  const PHP_SERVER_CODE = `<?php
/**
 * KILATQUIZ - REAL-TIME WEBSOCKET SERVER (PHP NATIVE SOCKETS)
 * Jalankan di aaPanel Linux via Supervisor atau Terminal: php server.php
 */
error_reporting(E_ALL);
set_time_limit(0);
ob_implicit_flush();

$host = '0.0.0.0';
$port = 8080;

$server = stream_socket_server("tcp://$host:$port", $errno, $errstr);
if (!$server) {
    die("Gagal menjalankan server WebSocket: $errstr ($errno)\\n");
}

echo "🚀 KilatQuiz PHP WebSocket Server berjalan di port $port\\n";

$clients = [];
$handshakes = [];
$rooms = [];

while (true) {
    $read = array_merge([$server], $clients);
    $write = null;
    $except = null;

    if (stream_select($read, $write, $except, 0, 200000) > 0) {
        if (in_array($server, $read)) {
            $newClient = stream_socket_accept($server);
            if ($newClient) {
                $clients[(int)$newClient] = $newClient;
                $handshakes[(int)$newClient] = false;
            }
            unset($read[array_search($server, $read)]);
        }

        foreach ($read as $clientSocket) {
            $clientId = (int)$clientSocket;
            $data = @fread($clientSocket, 4096);

            if (empty($data)) {
                @fclose($clientSocket);
                unset($clients[$clientId]);
                unset($handshakes[$clientId]);
                continue;
            }

            if (!$handshakes[$clientId]) {
                if (doHandshake($clientSocket, $data)) {
                    $handshakes[$clientId] = true;
                }
                continue;
            }

            $decoded = decodeWebSocketFrame($data);
            if ($decoded !== null) {
                $payload = json_decode($decoded, true);
                if ($payload) handleMessage($clientSocket, $payload, $rooms, $clients);
            }
        }
    }
}

function handleMessage($senderSocket, $data, &$rooms, &$clients) {
    $type = $data['type'] ?? '';
    if ($type === 'JOIN_ROOM') {
        $roomCode = $data['roomCode'];
        $player = $data['player'];
        $rooms[$roomCode]['players'][$player['id']] = $player;
        broadcastRoom($rooms[$roomCode], ['type' => 'PLAYER_JOINED', 'player' => $player], $clients);
    } elseif ($type === 'SUBMIT_ANSWER') {
        $roomCode = $data['roomCode'];
        $playerId = $data['playerId'];
        $option = $data['option'];
        $rooms[$roomCode]['answers'][$playerId] = $option;
        broadcastRoom($rooms[$roomCode], ['type' => 'ANSWER_RECEIVED', 'playerId' => $playerId], $clients);
    }
}

function broadcastRoom($room, $payload, &$clients) {
    $encoded = encodeWebSocketFrame(json_encode($payload));
    foreach ($clients as $c) @fwrite($c, $encoded);
}

function doHandshake($socket, $headers) {
    if (preg_match("/Sec-WebSocket-Key: (.*)\\r\\n/", $headers, $match)) {
        $key = trim($match[1]);
        $accept = base64_encode(pack('H*', sha1($key . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')));
        $upgrade = "HTTP/1.1 101 Switching Protocols\\r\\nUpgrade: websocket\\r\\nConnection: Upgrade\\r\\nSec-WebSocket-Accept: $accept\\r\\n\\r\\n";
        @fwrite($socket, $upgrade);
        return true;
    }
    return false;
}

function decodeWebSocketFrame($data) {
    $length = ord($data[1]) & 127;
    $masks = substr($data, 2, 4);
    $content = substr($data, 6);
    $text = '';
    for ($i = 0; $i < strlen($content); ++$i) {
        $text .= $content[$i] ^ $masks[$i % 4];
    }
    return $text;
}

function encodeWebSocketFrame($text) {
    $b1 = 0x81;
    $length = strlen($text);
    return pack('CC', $b1, $length) . $text;
}`;

  const SQL_CODE = `-- SKEMA DATABASE MYSQL UNTUK AAPANEL LINUX
CREATE DATABASE IF NOT EXISTS \`kilatquiz\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`kilatquiz\`;

CREATE TABLE IF NOT EXISTS \`quizzes\` (
    \`id\` VARCHAR(64) PRIMARY KEY,
    \`title\` VARCHAR(255) NOT NULL,
    \`description\` TEXT,
    \`category\` VARCHAR(100) NOT NULL,
    \`cover_image\` VARCHAR(500),
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS \`questions\` (
    \`id\` VARCHAR(64) PRIMARY KEY,
    \`quiz_id\` VARCHAR(64) NOT NULL,
    \`question_text\` TEXT NOT NULL,
    \`media_type\` ENUM('none', 'image', 'video') DEFAULT 'none',
    \`media_url\` VARCHAR(500),
    \`option_a\` VARCHAR(255) NOT NULL,
    \`option_b\` VARCHAR(255) NOT NULL,
    \`option_c\` VARCHAR(255) NOT NULL,
    \`option_d\` VARCHAR(255) NOT NULL,
    \`correct_index\` TINYINT NOT NULL,
    \`time_limit_sec\` INT DEFAULT 15,
    \`explanation\` TEXT,
    FOREIGN KEY (\`quiz_id\`) REFERENCES \`quizzes\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS \`global_leaderboard\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`player_name\` VARCHAR(100) NOT NULL,
    \`avatar_json\` JSON NOT NULL,
    \`xp_score\` INT DEFAULT 0,
    \`accuracy\` INT DEFAULT 0,
    \`tier\` VARCHAR(50) DEFAULT 'Master Kilat',
    \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;`;

  const NGINX_CODE = `# KONFIGURASI NGINX DI AAPANEL
server {
    listen 80;
    listen 443 ssl http2;
    server_name kuis.domainanda.com;
    root /www/wwwroot/kilatquiz/public;
    index index.html index.php;

    # 1. Reverse Proxy WebSocket Real-Time ke PHP (Port 8080)
    location /ws {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400s;
    }

    # 2. Handler PHP-FPM untuk REST API
    location ~ \\.php$ {
        fastcgi_pass unix:/tmp/php-cgi-82.sock; # Sesuaikan versi PHP
        fastcgi_index index.php;
        include fastcgi.conf;
    }

    # 3. Frontend SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}`;

  const currentCode = 
    activeTab === 'server' ? PHP_SERVER_CODE :
    activeTab === 'sql' ? SQL_CODE :
    activeTab === 'nginx' ? NGINX_CODE :
    PHP_SERVER_CODE;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = 
      activeTab === 'server' ? 'server.php' :
      activeTab === 'sql' ? 'database.sql' :
      activeTab === 'nginx' ? 'nginx-aapanel.conf' : 'code.txt';

    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div className="p-3 bg-indigo-950 border border-indigo-800 rounded-2xl text-indigo-400">
            <FileCode2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-display text-white">
              Source Code Versi PHP & Konfigurasi aaPanel
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Seluruh kode backend PHP native, skema MySQL, dan Nginx aaPanel sudah siap pakai.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-4 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('server')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'server' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>server.php (WebSocket)</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sql' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>database.sql (MySQL)</span>
          </button>

          <button
            onClick={() => setActiveTab('nginx')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'nginx' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>nginx-aapanel.conf</span>
          </button>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-hidden flex flex-col relative font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[11px] text-slate-400">
            <span>
              {activeTab === 'server' && 'Lokasi: /php-version/server.php (Jalankan via Supervisor aaPanel)'}
              {activeTab === 'sql' && 'Lokasi: /php-version/database.sql (Impor via menu Database aaPanel)'}
              {activeTab === 'nginx' && 'Lokasi: /php-version/nginx-aapanel.conf (Salin ke Config Website aaPanel)'}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded flex items-center gap-1 transition"
              >
                <Download className="w-3 h-3" />
                <span>Unduh File</span>
              </button>
            </div>
          </div>

          <pre className="flex-1 overflow-y-auto text-slate-300 leading-relaxed pr-2">
            <code>{currentCode}</code>
          </pre>
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>
            💡 Seluruh file ini juga sudah tersimpan di direktori proyek lokal <strong className="text-indigo-400">/php-version/</strong>.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
