<?php
/**
 * REST API Papan Peringkat Global (PHP + MySQL PDO)
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Konfigurasi Database MySQL
$db_host = 'localhost';
$db_name = 'kilatquiz';
$db_user = 'root';
$db_pass = ''; // Sesuaikan dengan password database di aaPanel

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    // Jika belum terhubung DB, kembalikan data cadangan JSON
    $seed = [
        [
            'id' => 'user-1',
            'playerName' => 'Rian_SiKilat',
            'avatar' => ['iconId' => 'cat', 'colorTheme' => 'amber', 'accessory' => 'crown', 'title' => 'Master Kilat ⚡'],
            'xpScore' => 28450,
            'gamesPlayed' => 42,
            'winCount' => 29,
            'accuracy' => 94,
            'tier' => 'Master Kilat',
            'lastActive' => '2 menit lalu'
        ],
        [
            'id' => 'user-2',
            'playerName' => 'Siti_Quantum',
            'avatar' => ['iconId' => 'owl', 'colorTheme' => 'indigo', 'accessory' => 'glasses', 'title' => 'Juara Galaksi 🌌'],
            'xpScore' => 24100,
            'gamesPlayed' => 36,
            'winCount' => 22,
            'accuracy' => 91,
            'tier' => 'Master Kilat',
            'lastActive' => '15 menit lalu'
        ]
    ];
    echo json_encode($seed);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT * FROM global_leaderboard ORDER BY xp_score DESC LIMIT 50");
    $rows = $stmt->fetchAll();

    $output = [];
    foreach ($rows as $row) {
        $output[] = [
            'id' => $row['id'],
            'playerName' => $row['player_name'],
            'avatar' => json_decode($row['avatar_json'], true),
            'xpScore' => (int)$row['xp_score'],
            'gamesPlayed' => (int)$row['games_played'],
            'winCount' => (int)$row['win_count'],
            'accuracy' => (int)$row['accuracy'],
            'tier' => $row['tier'],
            'lastActive' => date('d M Y', strtotime($row['updated_at']))
        ];
    }
    echo json_encode($output);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!empty($input['playerName'])) {
        $stmt = $pdo->prepare("INSERT INTO global_leaderboard (player_name, avatar_json, xp_score, accuracy, tier) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $input['playerName'],
            json_encode($input['avatar'] ?? []),
            $input['xpScore'] ?? 0,
            $input['accuracy'] ?? 100,
            $input['tier'] ?? 'Pejuang Trivia'
        ]);
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Nama pemain wajib diisi']);
    }
}
