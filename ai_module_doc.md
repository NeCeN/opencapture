Fichiers créés/modifiés : 

/var/www/html/opencapture/bin/scripts/artificial_intelligence
/var/www/html/opencapture/bin/install/migration_sql/2.5.0.sql
/var/www/html/opencapture/instance/sql/structure.sql
/var/www/html/opencapture/instance/sql/data_fr.sql
/var/www/html/opencapture/bin/install/pip-requirements.txt

/var/www/html/opencapture/src/backend/import_rest.py
/var/www/html/opencapture/src/backend/import_models.py
/var/www/html/opencapture/src/backend/import_controllers.py
/var/www/html/opencapture/src/backend/__init__.py
/var/www/html/opencapture/src/backend/rest/artificial_intelligence.py
/var/www/html/opencapture/src/backend/controllers/artificial_intelligence.py
/var/www/html/opencapture/src/backend/models/artificial_intelligence.py
/var/www/html/opencapture/src/backend/classes/Files.py

/var/www/html/opencapture/src/frontend/style.scss
/var/www/html/opencapture/src/frontend/app/settings/splitter/artificial-intelligence
/var/www/html/opencapture/src/frontend/app/settings/splitter/inputs
/var/www/html/opencapture/src/frontend/app/settings/settings-routing.module.ts
/var/www/html/opencapture/src/frontend/services/settings.service.ts
/var/www/html/opencapture/src/frontend/app/app.module.ts

/var/www/html/opencapture/src/assets/i18n/frontend/fra.json
/var/www/html/opencapture/src/assets/i18n/frontend/eng.json

/var/www/html/opencapture/ai_module_doc.md

Fonctions :
**add_train_text_to_csv** -> Fonction qui regroupe plusieurs autres fonctions pour effectuer le traitement d'une image, l'ocr de cette même image, le traitement du texte et enfin l'ajout de ce texte dans un fichier csv.
_files.adjust_image : pour traiter l'image et la mettre en noir et blanc binaire
_ocr.text_builder : lecture via ocr du fichier
word_cleaning : séparation des mots obtenus via l'ocr. Garde uniquement les charactères alphabétiques. Supprime les mots courants comme "est","le","un","a"... Il y a également une aide manuelle à la détection de CNI et permis (français).
stemming : garde uniquement la racine des mots; facture devient "fact"
add_to_csv : ajoute les données obtenus à un fichier csv, qui sera utilisé pour l'apprentissage.

**launch_train_model** -> Fonction qui lance l'entraînement du modèle. Sont effectués dans l'ordre:
la sépration des données, la vectorisation des mots(les mots deviennent vecteurs en fonction de leur fréquence d'apparition), l'apprentissage du modèle et la phase de test.

**launch_pred** -> fonction qui en regroupe plusisurs pour lancer une prédition sur un document. Elle contient :
store_one_file : traite une image et stocke les réusltats de son ocr dasn un csv.
model_testing : charge un modèle enregistré au préalable et fait la prédiction à partir es données d'un csv.
