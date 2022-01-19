<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// require './PHPmailer/PHPMailer.php';
// require './PHPmailer/Exception.php';
// require './PHPmailer/SMTP.php';

function sendEmail($to, $subject, $msgHTML, $altBody) {
    $result = false;
    try {
        $mail = new PHPMailer;
        $mail->isSMTP();
        $mail->SMTPDebug = 0; // 0 = off (for production use) - 1 = client messages - 2 = client and server messages
        $mail->Host = "smtp.gmail.com"; // use $mail->Host = gethostbyname('smtp.gmail.com'); // if your network does not support SMTP over IPv6
        $mail->Port = 587; // TLS only
        $mail->SMTPSecure = 'tls'; // ssl is depracated
        $mail->SMTPAuth = true;
        $mail->Username = "mailtest270406@gmail.com";
        $mail->Password = "JonasNaumann27!";
        $mail->setFrom('mailtest270406@gmail.com', 'Eduquiz');
        $mail->addAddress($to);
        $mail->Subject = $subject;
        $mail->msgHTML($msgHTML);
        $mail->AltBody = $altBody;
        // $mail->addAttachment('images/phpmailer_mini.png'); //Attach an image file
    
        if (!$mail->send()) {
            echo "Mailer Error: " . $mail->ErrorInfo;
        } else{
            echo "Message sent!";
            $result = true;
        }
    } catch (Exception $e) {
        echo $e;
    }
  return $result;
}