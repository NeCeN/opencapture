# This file is part of Open-Capture.

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture. If not, see <https://www.gnu.org/licenses/>.

# @dev : Oussama BRICH <oussama.brich@edissyum.com>

def process(args, file, log, splitter, files, batch_folder, config, docservers, ocr, regex):
    """
    :param args:
    :param file: File path to split
    :param log: log object
    :param splitter: Splitter object
    :param files: Files object
    :param batch_folder: batch folder path
    :param config: Config object
    :param ocr: PyTesseract object
    :param regex: regex content values
    :return: N/A
    """
    log.info('Processing file for separation : ' + file)

    batch_folder_path = f"{docservers['SPLITTER_BATCHES']}/{batch_folder}/"
    batch_thumbs_path = f"{docservers['SPLITTER_THUMB']}/{batch_folder}/"
    files.save_img_with_pdf2image(file, batch_folder_path + "page")
    files.save_img_with_pdf2image_min(file, batch_thumbs_path + "page", single_file=False)

    list_files = files.sorted_file(batch_folder_path, 'jpg')
    blank_pages = []

    # Remove blank pages
    if splitter.separator_qr.remove_blank_pages:
        cpt = 0
        tmp_list_files = list_files
        for f in tmp_list_files:
            if files.is_blank_page(f[1]):
                blank_pages.append(cpt)
            cpt = cpt + 1

    splitter.separator_qr.run(file)
    split(splitter, list_files)
    splitter.get_result_documents(blank_pages)
    original_file = file
    file = files.move_to_docservers(docservers, file, 'splitter')
    splitter.save_documents(batch_folder, file, args['input_id'], original_file)


def split(splitter, pages):
    """
    Customized split method
    :param splitter: Splitter object
    :param pages: pages list
    :return: N/A
    """
    maarch_value = None
    for index, path in pages:
        separator_type = None
        is_separator = list(filter(lambda separator: int(separator['num']) + 1 == int(index),
                                   splitter.separator_qr.pages))
        if is_separator:
            qr_code = is_separator[0]['qr_code']
            splitter.log.info("QR Code in page " + str(index) + " : " + str(qr_code))

            """
                Maarch separator (MAARCH_ is a Maarch prefix)
            """
            if 'MAARCH_' in qr_code and '|' not in qr_code:
                maarch_value = qr_code
                separator_type = splitter.doc_start
            else:
                if splitter.bundle_start in qr_code:
                    separator_type = splitter.bundle_start

            splitter.log.info("Code QR in page " + str(index) + " : " + qr_code)

        splitter.qr_pages.append({
            'source_page': index,
            'separator_type': separator_type,
            'doctype_value': None,
            'maarch_value': maarch_value,
            'metadata_1': None,
            'metadata_2': None,
            'metadata_3': None,
            'path': path,
        })
