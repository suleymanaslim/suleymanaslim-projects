<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Not Hesaplama Aracı</title>
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body, html {
            height: 100%;
            margin: 0;
        }
        .container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            padding: 15px;
        }
        .form-group, .btn {
            width: 100%;
        }
        .btn-rounded {
            border-radius: 20px;
        }
        .grade-table td, .grade-table th {
            text-align: center;
        }
        .passing-grade {
            background-color: yellow;
        }
        .failing-grade {
            background-color: red;
        }
        .excellent-grade {
            background-color: lightgreen;
        }
        .content {
            flex: 1;
            max-width: 600px;
            padding: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <div class="card p-4">
                <h2 class="text-center">Not Hesaplama Aracı</h2>
                <form action="" method="post">
                    <div class="form-group">
                        <label for="midtermScore">Lütfen vize notunuzu giriniz:</label>
                        <input type="number" class="form-control" id="midtermScore" name="midtermScore" min="0" max="100" required value="<?php echo isset($_POST['midtermScore']) ? $_POST['midtermScore'] : ''; ?>">
                    </div>
                    <button type="submit" class="btn btn-secondary btn-rounded">Hesapla</button>
                </form>

                <?php
                header('Content-Type: text/html; charset=utf-8');
                function calculateMinimumFinal($midtermScore, $lowerBound) {
                    $midtermWeight = $midtermScore * 0.3;
                    return max(0, ceil(($lowerBound - $midtermWeight) / 0.7));
                }

                if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['midtermScore'])) {
                    $midtermScore = $_POST['midtermScore'];
                    $grades = [
                        '2.00' => 60,
                        '2.50' => 65,
                        '3.00' => 70,
                        '3.50' => 80,
                        '4.00' => 90
                    ];

                    echo "<table class='table mt-4'>";
                    echo "<thead><tr><th>İstenilen Not Ortalaması</th><th>Finalden Almanız Gereken Minimum Not</th></tr></thead>";
                    echo "<tbody>";
                    foreach ($grades as $grade => $lowerBound) {
                        $finalScore = calculateMinimumFinal($midtermScore, $lowerBound);
                        if ($finalScore > 100) {
                            echo "<tr><td>$grade</td><td>Maalesef bu notu almanız artık ahirete kaldı :(</td></tr>";
                        } else {
                            echo "<tr><td>$grade</td><td>$finalScore</td></tr>";
                        }
                    }
                    echo "</tbody></table>";
                }
                ?>

                <!-- Not Tablosu Düğmesi -->
                <button type="button" class="btn btn-link mt-3" data-toggle="modal" data-target="#gradeTableModal">
                    Not Tablosu
                </button>

                <!-- Modal -->
                <div class="modal fade" id="gradeTableModal" tabindex="-1" role="dialog" aria-labelledby="gradeTableModalLabel" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="gradeTableModalLabel">Not Puanlama Tablosu</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <table class="table grade-table">
                                    <thead>
                                        <tr>
                                            <th>Not Aralığı</th>
                                            <th>Harf Notu</th>
                                            <th>Katsayı</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr class="excellent-grade"><td>90-100</td><td>AA</td><td>4.00</td></tr>
                                        <tr class="excellent-grade"><td>80-89</td><td>BA</td><td>3.50</td></tr>
                                        <tr class="excellent-grade"><td>70-79</td><td>BB</td><td>3.00</td></tr>
                                        <tr class="passing-grade"><td>65-69</td><td>CB</td><td>2.50</td></tr>
                                        <tr class="passing-grade"><td>60-64</td><td>CC</td><td>2.00</td></tr>
                                        <tr class="failing-grade"><td>50-59</td><td>DD</td><td>1.50</td></tr>
                                        <tr class="failing-grade"><td>30-49</td><td>FD</td><td>1.00</td></tr>
                                        <tr class="failing-grade"><td>0-29</td><td>FF</td><td>0.00</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Kapat</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
</body>
</html>
