# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Oussama Brich <oussama.brich@edissyum.com>

import json
from flask import Blueprint, request, make_response, jsonify
from src.backend.controllers import auth, artificial_intelligence, doctypes

bp = Blueprint('artificial_intelligence', __name__, url_prefix='/ws/')


@bp.route('artificial_intelligence/getTrainDocuments', methods=['GET'])
@auth.token_required
def get_train_documents():
    res = artificial_intelligence.retrieve_documents()
    return make_response(jsonify(res)), 200


@bp.route('artificial_intelligence/getAIModels', methods=['GET'])
@auth.token_required
def get_ai_models():
    args = {
        'select': ['*'],
        'where': ["status = 'OK'"],
    }
    _models = artificial_intelligence.get_models(args)

    return make_response(jsonify(_models[0])), _models[1]


@bp.route('artificial_intelligence/getById/<int:model_id>', methods=['GET'])
@auth.token_required
def get_output_by_id(model_id):
    _model = artificial_intelligence.get_model_by_id(model_id)
    return make_response(jsonify(_model[0])), _model[1]


@bp.route('artificial_intelligence/TrainModel/<string:model_name>', methods=['POST'])
@auth.token_required
def train_model(model_name):
    data = json.loads(request.data)
    artificial_intelligence.launch_train(data, model_name)
    res = "Model training started"
    return make_response(jsonify(res)), 200


@bp.route('artificial_intelligence/update/<int:model_id>', methods=['POST'])
@auth.token_required
def update_model(model_id):
    data = json.loads(request.data)
    args = {'set': {'model_path': data["var1"], 'min_proba': data["var2"],
                    'documents': json.dumps(data["var3"])}, 'model_id': model_id}
    artificial_intelligence.rename_model(data["var1"], model_id)
    res = artificial_intelligence.update_model(args)
    return make_response(jsonify(res)), 200


@bp.route('artificial_intelligence/delete/<int:model_id>', methods=['DELETE'])
@auth.token_required
def delete_model(model_id):
    args = {'set': {'status': 'DEL'}, 'model_id': model_id}
    res = artificial_intelligence.update_model(args)
    return make_response(jsonify(res)), 200


@bp.route('artificial_intelligence/testModel/<string:model_name>', methods=['POST'])
@auth.token_required
def test_model(model_name):
    data = request.files['file']
    res = artificial_intelligence.launch_pred(model_name, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('artificial_intelligence/list/<string:_type>', methods=['GET'])
@auth.token_required
def retrieve_target_doctypes(_type):
    args = {
        'where': ['type = %s', 'status <> %s'],
        'data': [_type, 'DEL']
    }
    res = doctypes.retrieve_doctypes(args)
    return make_response(jsonify(res[0])), res[1]
