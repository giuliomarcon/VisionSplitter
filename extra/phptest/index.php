<form enctype="multipart/form-data" action="" method="POST">
Choose an invoice to upload: <input name="uploadScontrino" type="file" /><br />
<input type="submit" value="Carica Scontrino" />
</form>

<?php

// settaggi vari
$APIKEY = 'AIzaSyB8D-q0yx_xa4hl0EtFX1PtHkn9mDn_CeI';
$url = "https://vision.googleapis.com/v1/images:annotate?key=" . $APIKEY;
$tipo_riconoscimento = "TEXT_DETECTION";

// tipologie mime permesse
// Per il momento ci accontentiamo solo di questo tipo di immagini
$tipi_permessi = array('image/jpeg','image/png','image/gif');

if($_FILES){

	// controllo che il file caricato abbia un mime type corretto
	if(in_array($_FILES['uploadScontrino']['type'],$tipi_permessi)){	    	

			// codifica base64 dell'immagine
	    	$image = file_get_contents($_FILES['uploadScontrino']['tmp_name']);
			$image_base64 = base64_encode($image);

			$json_request ='{
				  	"requests": [
						{
						  "image": {
						    "content":"' . $image_base64. '"
						  },
						  "features": [
						      {
						      	"type": "' .$tipo_riconoscimento. '",
								"maxResults": 200
						      }
						  ]
						}
					]
				}';

			$curl = curl_init();

			curl_setopt($curl, CURLOPT_URL, $url);
			curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
			curl_setopt($curl, CURLOPT_HTTPHEADER, array("Content-type: application/json"));
			curl_setopt($curl, CURLOPT_POST, true);
			curl_setopt($curl, CURLOPT_POSTFIELDS, $json_request);

			$json_response = curl_exec($curl);

			$tempoRisposta = time();
			file_put_contents($tempoRisposta.'.json', $json_response);
			
			$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

			curl_close($curl);

			// Verifichiamo se la richiesta è andata a buon fine
			if ( $status != 200 ) {
   				 die("Qualcosa è andato storto. Errore: $status" );
				}
			/*
			echo '<pre>';
			print_r($json_response);
			echo '</pre>';
			*/
			// Crea un identificatore per l'immagine caricata
			switch($_FILES['uploadScontrino']['type']){
				case 'image/jpeg':
					$im = imagecreatefromjpeg($_FILES['uploadScontrino']['tmp_name']);
					break;
				case 'image/png':
					$im = imagecreatefrompng($_FILES['uploadScontrino']['tmp_name']);
					break;
				case 'image/gif':
					$im = imagecreatefromgif($_FILES['uploadScontrino']['tmp_name']);
					break;
				}

			$rosso = imagecolorallocate($im, 255, 0, 42);

			// Converte la risposta in un array (associativo)
			$risposta = json_decode($json_response, true);

			// Per ogni frammento di testo riconosciuto printeremo un rettangolino
			// utilizzeremo i vertici forniti nella risposta dall'API
			foreach($risposta['responses'][0]['textAnnotations'] as $box){
	
				$punti = array();

				foreach($box['boundingPoly']['vertices'] as $vertice){
					array_push($punti, $vertice['x'], $vertice['y']);
					}
				
				imagesetthickness($im, 6);
				imagepolygon($im, $punti, count($box['boundingPoly']['vertices']), $rosso);

				}

			// Salva l'immagine con un nome
			$image_name = $tempoRisposta .'.jpg';
			imagejpeg($im, $image_name);
			imagedestroy($im);

			// Stampa il risultato finale
			echo'<div style="width:20%; float:left;"><img src="'.$image_name.'" style="width:100%;"/></div>';

			echo'<div style="width:50%; float:left; padding:20px;">';
					// Mostra il testo riconosciuto
					echo'<pre>';
					print_r($risposta['responses'][0]['textAnnotations'][0]['description']);
					echo'</pre>';
			echo'</div>';

	    	}
	    else{
	    	echo 'Tipo di file non consentito';
	    	}

	}
?>