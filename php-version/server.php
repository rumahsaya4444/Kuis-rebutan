<?php
/**
 * ===================================================================
 * KILATQUIZ - REAL-TIME WEBSOCKET SERVER (PHP NATIVE SOCKETS)
 * Cocok untuk dijalankan di Linux aaPanel / VPS via Terminal atau PM2
 * Port default: 8080 (di-reverse proxy oleh Nginx ke /ws)
 * ===================================================================
 */

error_reporting(E_ALL);
set_time_limit(0);
ob_implicit_flush();

$host = '0.0.0.0';
$port = 8080;

$server = stream_socket_server("tcp://$host:$port", $errno, $errstr);
if (!$server) {
    die("Gagal memulai server WebSocket: $errstr ($errno)\n");
}

echo "========================================================\n";
echo "🚀 KilatQuiz PHP WebSocket Server berjalan di port $port\n";
echo "Mendukung koneksi real-time Layar Besar Host & HP Peserta\n";
echo "========================================================\n";

$clients = [];
$handshakes = [];
$rooms = []; // Menyimpan state room kuis real-time

while (true) {
    $read = array_merge([$server], $clients);
    $write = null;
    $except = null;

    if (stream_select($read, $write, $except, 0, 200000) > 0) {
        // Koneksi baru masuk
        if (in_array($server, $read)) {
            $newClient = stream_socket_accept($server);
            if ($newClient) {
                $clients[(int)$newClient] = $newClient;
                $handshakes[(int)$newClient] = false;
                echo "[CONNECT] Klien terhubung: " . (int)$newClient . "\n";
            }
            unset($read[array_search($server, $read)]);
        }

        // Baca pesan dari klien yang terhubung
        foreach ($read as $clientSocket) {
            $clientId = (int)$clientSocket;
            $data = @fread($clientSocket, 4096);

            if (empty($data)) {
                // Klien menutup koneksi
                echo "[DISCONNECT] Klien keluar: $clientId\n";
                @fclose($clientSocket);
                unset($clients[$clientId]);
                unset($handshakes[$clientId]);
                continue;
            }

            // Lakukan WebSocket Handshake jika belum
            if (!$handshakes[$clientId]) {
                if (doHandshake($clientSocket, $data)) {
                    $handshakes[$clientId] = true;
                    echo "[HANDSHAKE] Handshake berhasil untuk klien $clientId\n";
                }
                continue;
            }

            // Decode WebSocket frame
            $decoded = decodeWebSocketFrame($data);
            if ($decoded === null) continue;

            $payload = json_decode($decoded, true);
            if (!$payload) continue;

            handleMessage($clientSocket, $payload, $rooms, $clients);
        }
    }
}

/**
 * Handle pesan JSON dari Host atau Peserta
 */
function handleMessage($senderSocket, $data, &$rooms, &$clients) {
    $type = $data['type'] ?? '';
    echo "[EVENT] $type diterima\n";

    switch ($type) {
        case 'CREATE_ROOM':
            $roomCode = $data['roomCode'];
            $quiz = $data['quiz'] ?? [];
            $rooms[$roomCode] = [
                'roomCode' => $roomCode,
                'quiz' => $quiz,
                'phase' => 'LOBBY',
                'currentQuestionIndex' => 0,
                'timeRemainingSeconds' => 15,
                'players' => [],
                'answersReceived' => [],
                'hostSocket' => (int)$senderSocket
            ];

            sendFrame($senderSocket, json_encode([
                'type' => 'ROOM_CREATED',
                'state' => $rooms[$roomCode]
            ]));
            break;

        case 'JOIN_ROOM':
            $roomCode = $data['roomCode'];
            $player = $data['player'];

            if (!isset($rooms[$roomCode])) {
                // Buat room otomatis jika belum ada
                $rooms[$roomCode] = [
                    'roomCode' => $roomCode,
                    'quiz' => ['questions' => []],
                    'phase' => 'LOBBY',
                    'currentQuestionIndex' => 0,
                    'timeRemainingSeconds' => 15,
                    'players' => [],
                    'answersReceived' => []
                ];
            }

            $rooms[$roomCode]['players'][$player['id']] = $player;
            $rooms[$roomCode]['playerSockets'][$player['id']] = (int)$senderSocket;

            broadcastRoom($rooms[$roomCode], [
                'type' => 'PLAYER_JOINED',
                'player' => $player,
                'state' => $rooms[$roomCode]
            ], $clients);
            break;

        case 'START_GAME':
            $roomCode = $data['roomCode'] ?? array_key_first($rooms);
            if (isset($rooms[$roomCode])) {
                $rooms[$roomCode]['phase'] = 'QUESTION';
                $rooms[$roomCode]['currentQuestionIndex'] = 0;
                $rooms[$roomCode]['answersReceived'] = [];
                $rooms[$roomCode]['timeRemainingSeconds'] = 15;

                broadcastRoom($rooms[$roomCode], [
                    'type' => 'GAME_STARTED',
                    'state' => $rooms[$roomCode]
                ], $clients);
            }
            break;

        case 'SUBMIT_ANSWER':
            $roomCode = $data['roomCode'];
            $playerId = $data['playerId'];
            $option = $data['option'];
            $timeElapsed = $data['timeElapsedMs'] ?? 1000;

            if (isset($rooms[$roomCode])) {
                $rooms[$roomCode]['answersReceived'][$playerId] = [
                    'option' => $option,
                    'timeElapsedMs' => $timeElapsed
                ];

                broadcastRoom($rooms[$roomCode], [
                    'type' => 'ANSWER_RECEIVED',
                    'playerId' => $playerId,
                    'totalAnswers' => count($rooms[$roomCode]['answersReceived'])
                ], $clients);
            }
            break;

        case 'NEXT_QUESTION':
            $roomCode = $data['roomCode'];
            if (isset($rooms[$roomCode])) {
                $rooms[$roomCode]['currentQuestionIndex']++;
                $rooms[$roomCode]['phase'] = 'QUESTION';
                $rooms[$roomCode]['answersReceived'] = [];

                broadcastRoom($rooms[$roomCode], [
                    'type' => 'PHASE_CHANGED',
                    'phase' => 'QUESTION',
                    'state' => $rooms[$roomCode]
                ], $clients);
            }
            break;
    }
}

/**
 * Broadcast pesan ke semua klien di dalam room
 */
function broadcastRoom($room, $payload, &$clients) {
    $encoded = encodeWebSocketFrame(json_encode($payload));
    foreach ($clients as $c) {
        @fwrite($c, $encoded);
    }
}

/**
 * WebSocket Handshake Protocol RFC 6455
 */
function doHandshake($socket, $headers) {
    if (preg_match("/Sec-WebSocket-Key: (.*)\r\n/", $headers, $match)) {
        $key = trim($match[1]);
        $accept = base64_encode(pack('H*', sha1($key . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')));
        $upgrade = "HTTP/1.1 101 Switching Protocols\r\n" .
                   "Upgrade: websocket\r\n" .
                   "Connection: Upgrade\r\n" .
                   "Sec-WebSocket-Accept: $accept\r\n\r\n";
        @fwrite($socket, $upgrade);
        return true;
    }
    return false;
}

/**
 * Decode frame WebSocket yang dikirim dari browser
 */
function decodeWebSocketFrame($data) {
    $length = ord($data[1]) & 127;
    if ($length == 126) {
        $masks = substr($data, 4, 4);
        $content = substr($data, 8);
    } elseif ($length == 127) {
        $masks = substr($data, 10, 4);
        $content = substr($data, 14);
    } else {
        $masks = substr($data, 2, 4);
        $content = substr($data, 6);
    }
    $text = '';
    for ($i = 0; $i < strlen($content); ++$i) {
        $text .= $content[$i] ^ $masks[$i % 4];
    }
    return $text;
}

/**
 * Encode pesan JSON ke frame WebSocket RFC 6455
 */
function encodeWebSocketFrame($text) {
    $b1 = 0x81;
    $length = strlen($text);
    if ($length <= 125) {
        $header = pack('CC', $b1, $length);
    } elseif ($length > 125 && $length < 65536) {
        $header = pack('CCn', $b1, 126, $length);
    } else {
        $header = pack('CCNN', $b1, 127, 0, $length);
    }
    return $header . $text;
}

function sendFrame($socket, $text) {
    @fwrite($socket, encodeWebSocketFrame($text));
}
