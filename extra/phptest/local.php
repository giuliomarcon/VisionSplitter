<?php
	
	$image = file_get_contents(".jpg");
	$image_base64 = base64_encode($image);

	$risposta_json = file_get_contents(".json");

	$im = imagecreatefromjpeg($image);
	$rosso = imagecolorallocate($im, 255, 0, 42);

	$risposta = json_decode($risposta_json, true);

	foreach($risposta['responses'][0]['textAnnotations'] as $box){

		$punti = array();

		foreach($box['boundingPoly']['vertices'] as $vertice){
			array_push($punti, $vertice['x'], $vertice['y']);
		}
		
		imagesetthickness($im, 6);
		imagepolygon($im, $punti, count($box['boundingPoly']['vertices']), $rosso);

	}

	imagedestroy($im);

	echo'<div style="width:20%; float:left;"><img src="" style="width:100%;"/></div>';

	echo'<div style="width:50%; float:left; padding:20px;">';
		echo'<pre>';
			print_r($risposta['responses'][0]['textAnnotations'][0]['description']);
		echo'</pre>';
	echo'</div>';
?>