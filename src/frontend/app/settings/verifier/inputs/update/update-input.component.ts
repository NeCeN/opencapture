import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../../../../services/user.service";
import {AuthService} from "../../../../../services/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {LastUrlService} from "../../../../../services/last-url.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {LocalStorageService} from "../../../../../services/local-storage.service";
import {API_URL} from "../../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {FormControl} from "@angular/forms";
import {of} from "rxjs";

@Component({
    selector: 'app-update',
    templateUrl: './update-input.component.html',
    styleUrls: ['./update-input.component.scss']
})
export class UpdateInputComponent implements OnInit {
    headers         : HttpHeaders   = this.authService.headers;
    loading         : boolean       = true;
    inputId         : any;
    input           : any;
    inputForm       : any[]         = [
        {
            id: 'input_id',
            label: this.translate.instant('HEADER.label_short'),
            type: 'text',
            control: new FormControl(),
            disabled: true,
            required: true,
        },
        {
            id: 'input_label',
            label: this.translate.instant('HEADER.label'),
            type: 'text',
            control: new FormControl(),
            required: true,
        },
        {
            id: 'input_folder',
            label: this.translate.instant('INPUT.input_folder'),
            type: 'text',
            control: new FormControl(),
            placeholder: "/var/share/sortant",
            required: true,
        },
        {
            id: 'default_form_id',
            label: this.translate.instant('INPUT.default_form_id'),
            type: 'select',
            control: new FormControl(),
            required: true,
        },
        {
            id: 'purchase_or_sale',
            label: this.translate.instant('INPUT.purchase_or_sale'),
            type: 'select',
            control: new FormControl(),
            values: [
                {
                    'id': 'purchase',
                    'label': 'UPLOAD.purchase_invoice'
                },
                {
                    'id': 'sale',
                    'label': 'UPLOAD.sale_invoice'
                }
            ],
            required: true,
        },
        {
            id: 'override_supplier_form',
            label: this.translate.instant('INPUT.override_supplier_form'),
            type: 'boolean',
            control: new FormControl()
        },
    ];

    constructor(
        public router: Router,
        private http: HttpClient,
        private dialog: MatDialog,
        private route: ActivatedRoute,
        public userService: UserService,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService,
    ) {}


    ngOnInit(): void {
        console.log(this.translate.instant('UPLOAD.purchase_invoice'))
        this.serviceSettings.init();
        this.inputId = this.route.snapshot.params['id'];

        this.http.get(API_URL + '/ws/inputs/getById/' + this.inputId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.input = data
                for (let field in this.input) {
                    this.inputForm.forEach(element => {
                        if (element.id == field) {
                            element.control.setValue(data[field]);
                            if (element.id === 'default_form_id') {
                                this.http.get(API_URL + '/ws/forms/list', {headers: this.authService.headers}).pipe(
                                    tap((forms: any) => {
                                        element.values = forms.forms;
                                        console.log(element.values);
                                    }),
                                    catchError((err: any) => {
                                        console.debug(err);
                                        this.notify.handleErrors(err);
                                        return of(false);
                                    })
                                ).subscribe();
                            }
                        }
                    });
                }
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                this.router.navigate(['/settings/verifier/outputs']).then()
                return of(false);
            })
        ).subscribe();
    }

    isValidForm() {
        let state = true;
        this.inputForm.forEach(element => {
            if (element.control.status !== 'DISABLED' && element.control.status !== 'VALID') {
                state = false;
            }
            element.control.markAsTouched();
        });

        return state;
    }


    onSubmit() {
        if (this.isValidForm()) {
            let input : any = {};
            this.inputForm.forEach(element => {
                input[element.id] = element.control.value;
            });

            this.http.put(API_URL + '/ws/inputs/update/' + this.inputId, {'args': input}, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.notify.success(this.translate.instant('INPUT.updated'));
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err, '/verifier/inputs');
                    return of(false);
                })
            ).subscribe();
        }
    }

    createScriptAndIncron() {
        if (this.isValidForm()) {
            let input: any = {};
            this.inputForm.forEach(element => {
                input[element.id] = element.control.value;
            });
            this.http.post(API_URL + '/ws/inputs/createScriptAndIncron', {'args': input}, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.notify.success(this.translate.instant('INPUT.incron_and_script_updated'));
                    this.onSubmit();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    getErrorMessage(field: any) {
        let error = undefined;
        this.inputForm.forEach(element => {
            if (element.id == field) {
                if (element.required && !(element.value || element.control.value)) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        });
        return error;
    }
}