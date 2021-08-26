# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import os
import sys
import argparse
import mimetypes
from src.backend.main import create_classes
from src.backend.import_classes import _Config


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument("-c", "--config", required=True, help="path to config file")
    ap.add_argument("-f", "--file", required=False, help="path to referential file")
    args = vars(ap.parse_args())

    if not os.path.exists(args['config']):
        sys.exit('Config file couldn\'t be found')

    config_name = _Config(args['config'])
    config_file = config_name.cfg['PROFILE']['cfgpath'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini'
    config, locale, log, ocr, database, xml, spreadsheet = create_classes(config_file)

    file = spreadsheet.referencialSuppplierSpreadsheet
    if args['file']:
        if os.path.exists(args['file']):
            file = args['file']

    mime = mimetypes.guess_type(file)[0]
    contentSupplierSheet = None
    existingMimeType = False
    if mime in ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']:
        contentSupplierSheet = spreadsheet.read_excel_sheet(file)
        existingMimeType = True
    elif mime in ['application/vnd.oasis.opendocument.spreadsheet']:
        contentSupplierSheet = spreadsheet.read_ods_sheet(file)
        existingMimeType = True
    elif mime in ['text/csv']:
        contentSupplierSheet = spreadsheet.read_csv_sheet(file)
        existingMimeType = True

    if existingMimeType:
        spreadsheet.construct_supplier_array(contentSupplierSheet)

        # Retrieve the list of existing suppliers in the database
        args = {
            'select': ['vat_number'],
            'table': ['accounts_supplier'],
        }
        list_existing_supplier = database.select(args)
        # Insert into database all the supplier not existing into the database
        for taxe_number in spreadsheet.referencialSupplierData:
            if not any(str(taxe_number) in value['vat_number'] for value in list_existing_supplier):
                args = {
                    'table': 'addresses',
                    'columns': {
                        'address1': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['address1']]),
                        'address2': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['address2']]),
                        'postal_code': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['addressPostalCode']]),
                        'city': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['addressTown']]),
                        'country': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['addressCountry']]),
                    }
                }

                address_id = database.insert(args)

                args = {
                    'table': 'accounts_supplier',
                    'columns': {
                        'vat_number': str(taxe_number),
                        'name': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['name']]),
                        'siren': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['SIREN']]),
                        'siret': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['SIRET']]),
                        'typology': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['typology']]),
                        'get_only_raw_footer': not spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['get_only_raw_footer']],
                        'address_id': str(address_id),
                    }
                }
                res = database.insert(args)

                if res:
                    log.info('The following supplier was successfully added into database : ' +
                             str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['name']]))
                else:
                    log.error('While adding supplier : ' +
                              str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['name']]))
            else:
                address_id = database.select({
                    'select': ['address_id'],
                    'table': ['accounts_supplier'],
                    'where': ['vat_number = %s'],
                    'data': [taxe_number]
                })[0]['address_id']

                get_only_raw_footer = True
                if spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['get_only_raw_footer']] == 'True':
                    get_only_raw_footer = False

                args = {
                    'table': ['addresses'],
                    'set': {
                        'address1': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['address1']]),
                        'address2': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['address2']]),
                        'postal_code': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['addressPostalCode']]),
                        'city': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['addressTown']]),
                        'country': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['addressCountry']]),
                    },
                    'where': ['id = %s'],
                    'data': [address_id if address_id else 0]
                }
                if address_id:
                    database.update(args)
                else:
                    args['columns'] = args['set']
                    args['table'] = args['table'][0]
                    del args['set']
                    del args['where']
                    del args['data']
                    address_id = database.insert(args)

                args = {
                    'table': ['accounts_supplier'],
                    'set': {
                        'name': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['name']]),
                        'siren': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['SIREN']]),
                        'siret': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['SIRET']]),
                        'typology': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['typology']]),
                        'get_only_raw_footer': get_only_raw_footer,
                        'address_id': address_id
                    },
                    'where': ['vat_number = %s'],
                    'data': [taxe_number]
                }
                res = database.update(args)
                if res[0]:
                    log.info('The following supplier was successfully updated into database : ' +
                             str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['name']]))
                else:
                    log.error('While updating supplier : ' +
                              str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['name']]))

        # Commit and close database connection
        database.conn.commit()
        database.conn.close()
