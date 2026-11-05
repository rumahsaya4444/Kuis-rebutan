<?php
/**
 * REST API Sinkronisasi Akun Lintas Perangkat (PHP + MySQL)
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$db_host = 'localhost';
$db_name = 'kilatquiz';
$db_user = 'root';
$db_pass = '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Gagal terhubung database']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $token = $_GET['token'] ?? '';
    if (empty($token)) {
        echo json_encode(['success' => false, 'message' => 'Token sinkronisasi tidak disertakan']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM user_accounts WHERE sync_token = ?");
    $stmt->execute([$token]);
    $account = $stmt->fetch();

    if ($account) {
        echo json_encode([
            'success' => true,
            'profile' => [
                'syncToken' => $account['sync_token'],
                'name' => $account['player_name'],
                'avatar' => json_decode($account['avatar_json'], true),
                'stats' => json_decode($account['stats_json'], true),
                'customQuizzes' => json_decode($account['custom_quizzes_json'] ?? '[]', true)
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Profil tidak ditemukan untuk token ini']);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $token = $data['syncToken'] ?? '';
    $name = $data['name'] ?? 'Pemain';

    if (empty($token)) {
        echo json_encode(['success' => false, 'message' => 'Sync token wajib diisi']);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO user_accounts (sync_token, player_name, avatar_json, stats_json, custom_quizzes_json)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            player_name = VALUES(player_name),
            avatar_json = VALUES(avatar_json),
            stats_json = VALUES(stats_json),
            custom_quizzes_json = VALUES(custom_quizzes_json)
    ");

    $stmt->execute([
        $token,
        $name,
        json_encode($data['avatar'] ?? []),
        json_encode($data['stats'] ?? []),
        json_encode($data['customQuizzes'] ?? [])
    ]);

    echo json_encode(['success' => true, 'message' => 'Akun berhasil disimpan ke cloud MySQL']);
}
