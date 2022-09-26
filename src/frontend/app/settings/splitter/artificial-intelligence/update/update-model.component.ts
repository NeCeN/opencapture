import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../../../services/auth.service";
import { UserService } from "../../../../../services/user.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import {HistoryService} from "../../../../../services/history.service";
import { environment } from  "../../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import {lastValueFrom, of} from "rxjs";

@Component({
  selector: 'app-update-model',
  templateUrl: './update-model.component.html',
  styleUrls: ['./update-model.component.scss']
})

export class UpdateModelComponent implements OnInit {
    loading               : boolean       = true;
    modelId : number = 0;
    doc_types : any = [];
    forms : any = [];
    formById : any = [];
    outputForm          : any[]         = [
        {
            id: 'model_path',
            label: this.translate.instant("ARTIFICIAL-INTELLIGENCE.model_name"),
            type: 'text',
            control: new FormControl('', Validators.pattern("[a-zA-Z0-9+._-éùàî]+\\.sav+")),
            required: true,
        }, {
            id: 'min_proba',
            label:  this.translate.instant("ARTIFICIAL-INTELLIGENCE.min_proba"),
            type: 'text',
            control: new FormControl('', Validators.pattern("^[1-9][0-9]?$|^100$")),
            required: true,
        },
    ];
    dtypes!: string;
    dtarget! : string;
    doctypesFormControl : any = [];
    formsFormControl : any = [];
    tableData : any = [];
    displayedColumns: string[] = ['Documents','Formulaires','Doctypes'];
    chosenForm : any = [];
    chosenDocs : any = [];

    constructor(
        public router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public userService: UserService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        private historyService: HistoryService,
        public privilegesService: PrivilegesService) { }

    async ngOnInit(){
        this.serviceSettings.init();
        this.modelId = this.route.snapshot.params['id'];
        this.retrieveOCDoctypes();
        await this.retrieveForms();
        this.http.get(environment['url'] + '/ws/artificial_intelligence/getById/' + this.modelId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.dtypes = data.doc_types;
                this.dtarget = data.target;
                const targets = this.dtarget.split(', ');
                const selectedFormId : any = [];
                const len = targets.length;
                for(let i=0; i < len; i++) {
                    for (const element of this.doc_types){
                        if (element.label === targets[i]){
                            selectedFormId.push(element.formId);
                            break;
                        }
                    }
                    this.formById.push( (this.forms.find((a: { id: number }) => a.id === selectedFormId[i])).label );
                    this.chosenDocs[i]=this.doc_types.filter((a: { formId: number }) => a.formId === selectedFormId[i]);
                    this.doctypesFormControl.push(new FormControl(targets[i], [Validators.required]));
                    this.formsFormControl.push(new FormControl(this.formById[i], [Validators.required]));
                    this.tableData.push({Documents:this.dtypes.split(', ')[i], Doctypes:targets[i],Formulaires: this.formById[i], id: i});
                  }
                for (const field in data) {
                    if (data.hasOwnProperty(field)) {
                        this.outputForm.forEach(element => {
                            if (element.id === field) {
                                element.control.setValue(data[field]);
                                if (element.id === 'compress_type')
                                    if (data[field] === null || data[field] === undefined)
                                        element.control.setValue('');
                            }
                        });
                    }
                }
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                this.router.navigate(['/settings/splitter/outputs']).then();
                return of(false);
            })
        ).subscribe();
    }

    updateModel() {
        if (this.isValidForm(this.outputForm)) {
            const model_name = this.getValueFromForm(this.outputForm, 'model_path');
            const min_pred = this.getValueFromForm(this.outputForm, 'min_proba');
            const oc_targets = [];
            for (const element of this.doctypesFormControl){oc_targets.push(element.value);}
            if (this.modelId !== undefined) {
                this.http.post(environment['url'] + '/ws/artificial_intelligence/update/' + this.modelId, {var1: model_name, var2:min_pred, var3: oc_targets}, {headers: this.authService.headers}).pipe(
                    tap(() => {
                        this.notify.success(this.translate.instant('ARTIFICIAL-INTELLIGENCE.model_updated'));
                        this.historyService.addHistory('splitter', 'update_model', this.translate.instant('HISTORY-DESC.update-model', {model: model_name}));
                        this.router.navigate(['/settings/splitter/artificial-intelligence']).then();
                    }),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe();
            }
        }
    }

    isValidForm(form: any) {
        let state = true;
        form.forEach((element: any) => {
            if ((element.control.status !== 'DISABLED' && element.control.status !== 'VALID') || element.control.value == null) {
                state = false;
            }
            element.control.markAsTouched();
        });
        return state;
    }

    getValueFromForm(form: any, fieldId: any) {
        let value = '';
        form.forEach((element: any) => {
            if (fieldId === element.id) {
                value = element.control.value;
            }
        });
        return value;
    }

    retrieveOCDoctypes() {
        this.doc_types=[];
        this.http.get(environment['url'] + '/ws/artificial_intelligence/list/' + 'document', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                let newDoctype;
                data.doctypes.forEach((doctype: {
                    id          : number
                    key         : string
                    code        : string
                    label       : string
                    type        : string
                    status      : string
                    is_default  : boolean
                    form_id     : boolean
                }) => {
                    newDoctype = {
                        'id': doctype.id,
                        'key': doctype.key,
                        'code': doctype.code,
                        'label': doctype.label,
                        'type': doctype.type,
                        'status': doctype.status,
                        'isDefault': doctype.is_default,
                        'formId': doctype.form_id,
                    };
                    this.doc_types.push(newDoctype);
                }
                );
            }),
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    async retrieveForms(){
        const retrieve = this.http.get(environment['url'] + '/ws/forms/list?module=splitter', {headers: this.authService.headers}).pipe(
            tap((forms: any) => {
                this.forms = forms.forms;
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        );
        return await lastValueFrom(retrieve).then();
    }

    onFormSelect(event: any, index: number){
        const val = event.value;
        for (const element of this.forms) {
            if (element.label === val) {
                this.chosenForm[index]=element.id;
                this.chosenDocs[index]=this.doc_types.filter((a: { formId: number }) => a.formId === this.chosenForm[index]);
            }
        }
        this.doctypesFormControl[index].value = this.chosenDocs[index][0].label;
    }
}
