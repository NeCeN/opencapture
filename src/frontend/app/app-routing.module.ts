import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

import { LoginRedirectService } from '../services/login-redirect.service';
import { LoginRequiredService } from '../services/login-required.service';

import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from "./not-found/not-found.component";
import { UserProfileComponent } from "./profile/profile.component";
import { SplitterViewerComponent } from "./splitter/viewer/splitter-viewer.component";
import { SplitterListComponent } from "./splitter/list/splitter-list.component";
import { VerifierViewerComponent } from './verifier/viewer/verifier-viewer.component';
import { VerifierListComponent } from './verifier/list/verifier-list.component';
import { UploadComponent } from "./upload/upload.component";
import { SuppliersListComponent } from "./accounts/suppliers/list/suppliers-list.component"
import { UpdateSupplierComponent } from "./accounts/suppliers/update/update-supplier.component"
import { CreateSupplierComponent } from "./accounts/suppliers/create/create-supplier.component"
import { CustomersListComponent } from "./accounts/customers/list/customers-list.component"
import { UpdateCustomerComponent } from "./accounts/customers/update/update-customer.component"
import { CreateCustomerComponent } from "./accounts/customers/create/create-customer.component"
import { HasPrivilegeService } from "../services/has-privilege.service";

const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent , data: {title: marker('GLOBAL.home')}, canActivate: [LoginRequiredService]},
    {path: 'login', component: LoginComponent , data: {title: marker('GLOBAL.login')}, canActivate: [LoginRedirectService]},
    {path: 'logout', component: LogoutComponent , canActivate: [LoginRequiredService]},
    {path: 'profile/:id', component: UserProfileComponent, canActivate: [LoginRequiredService]},
    {
        path: 'splitter/viewer/:id', component: SplitterViewerComponent,
        data: {title: marker('SPLITTER.viewer'), privileges: ['splitter']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'splitter/list', component: SplitterListComponent,
        data: {title: marker('SPLITTER.list'), privileges: ['splitter']},
        canActivate: [LoginRequiredService, HasPrivilegeService]

    },
    {path: 'splitter', redirectTo: 'splitter/list', pathMatch: 'full'},
    {
        path: 'verifier/viewer/:id', component: VerifierViewerComponent,
        data: {title: marker('VERIFIER.viewer'), privileges: ['verifier']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'verifier/list', component: VerifierListComponent,
        data: {title: marker('VERIFIER.list'), privileges: ['verifier']},
        canActivate: [LoginRequiredService, HasPrivilegeService]

    },
    {path: 'verifier', redirectTo: 'verifier/list', pathMatch: 'full'},
    {
        path: 'upload', component: UploadComponent,
        data: {title: marker('GLOBAL.upload'), privileges: ['upload']},
        canActivate: [LoginRequiredService, HasPrivilegeService]

    },

    {path: 'accounts/suppliers', redirectTo: 'accounts/suppliers/list', pathMatch: 'full'},
    {
        path: 'accounts/suppliers/list', component: SuppliersListComponent,
        data: {title: marker('ACCOUNTS.suppliers_list'), privileges: ['suppliers_list']},
        canActivate: [LoginRequiredService, HasPrivilegeService]

    },
    {
        path: 'accounts/suppliers/update/:id', component: UpdateSupplierComponent,
        data: {title: marker('ACCOUNTS.update_supplier'), privileges: ['update_supplier']},
        canActivate: [LoginRequiredService, HasPrivilegeService]

    },
    {
        path: 'accounts/suppliers/create', component: CreateSupplierComponent,
        data: {title: marker('ACCOUNTS.create_supplier'), privileges: ['create_supplier']},
        canActivate: [LoginRequiredService, HasPrivilegeService]

    },

    {path: 'accounts/customers', redirectTo: 'accounts/customers/list', pathMatch: 'full'},
    {
        path: 'accounts/customers/list', component: CustomersListComponent,
        data: {title: marker('ACCOUNTS.customers_list'), privileges: ['customers_list']},
        canActivate: [LoginRequiredService, HasPrivilegeService]

    },
    {
        path: 'accounts/customers/update/:id', component: UpdateCustomerComponent,
        data: {title: marker('ACCOUNTS.update_customer'), privileges: ['update_customer']},
        canActivate: [LoginRequiredService, HasPrivilegeService]

    },
    {
        path: 'accounts/customers/create', component: CreateCustomerComponent,
        data: {title: marker('ACCOUNTS.create_customer'), privileges: ['create_customer']},
        canActivate: [LoginRequiredService, HasPrivilegeService]

    },

    {path: '404', component: NotFoundComponent}, // This two routes (** and 404) need to be the last of const routes: Routes variable
    {path: '**', redirectTo: '404'}, // if routes doesn't exists, redirect to 404, display a popup and then redirect to login
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {useHash: true})
    ],
    exports: [RouterModule]
})

export class AppRoutingModule {}