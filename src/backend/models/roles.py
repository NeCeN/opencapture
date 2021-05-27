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

from flask_babel import gettext
from ..controllers.db import get_db


def get_roles(args):
    db = get_db()
    roles = db.select({
        'select': ["*"] if "select" not in args else args["select"],
        'table': ["roles"],
        'where': ["status NOT IN (%s)", "editable <> %s"],
        'data': ["DEL", "false"],
        'order_by': ["id ASC"],
        'limit': str(args['limit']) if 'limit' in args else [],
        'offset': str(args['offset']) if 'offset' in args else [],
    })

    return roles


def get_role_by_id(args):
    db = get_db()
    error = None
    role = db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['roles'],
        'where': ['id = %s', "editable <> %s", "status NOT IN (%s)"],
        'data': [args['role_id'], 'false', 'DEL']
    })

    if not role:
        error = gettext('ROLE_DOESNT_EXISTS')
    else:
        role = role[0]

    return role, error


def update_role(args):
    db = get_db()
    error = None

    role = db.update({
        'table': ['roles'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['role_id']]
    })

    if role[0] is False:
        error = gettext('ROLE_UPDATE_ERROR')

    return role, error


def create_role(args):
    db = get_db()
    error = None

    role = db.insert({
        'table': 'roles',
        'columns': args['columns'],
    })

    if not role:
        error = gettext('ROLE_UPDATE_ERROR')

    return role, error


def update_role_privileges(args):
    db = get_db()
    error = None

    role = db.update({
        'table': ['roles_privileges'],
        'set': args['set'],
        'where': ['role_id = %s'],
        'data': [args['role_id']]
    })

    if role[0] is False:
        error = gettext('ROLE_PRIVILEGES_UPDATE_ERROR')

    return role, error


def create_role_privileges(args):
    db = get_db()
    error = None

    role_privilege = db.insert({
        'table': 'roles_privileges',
        'columns': {
            'role_id': str(args['role_id']),
        }
    })

    if not role_privilege:
        error = gettext('ROLE_PRIVILEGES_CREATE_ERROR')

    return role_privilege, error
