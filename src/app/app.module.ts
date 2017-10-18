import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AppComponent} from './app.component';
import {DetailsComponent} from './main/list/details/issue/issue-details.component';
import {DetailsService} from './main/list/issue.service';
import {HttpModule} from '@angular/http';
import {InlineComponent} from './main/list/details/inline/generic/inline.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {StoryinlineComponent} from './main/list/details/inline/story/storyinline.component';
import {ListComponent} from './main/list/issue/issue.component';
import {ListService} from './main/list.service';
import {SearchComponent} from './main/header/search/search.component';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {CoverinlineComponent} from './main/list/details/inline/cover/coverinline.component';
import {CreateComponent} from './main/footer/create/create.component';
import {CreateService} from './main/footer/create/create.service';
import {AutocompleteService} from './main/autocomplete.service';
import {AuthComponent} from './auth/auth.component';
import {MainComponent} from './main/main.component';
import {HeaderComponent} from './main/header/header.component';
import {FooterComponent} from './main/footer/footer.component';
import {MetaComponent} from './main/list/meta/meta.component';
import {MetainlineComponent} from './main/list/details/inline/meta/metainline.component';
import {RouterModule, Routes} from '@angular/router';
import {AuthService} from './auth/auth.service';
import {MetaDetailsComponent} from './main/list/details/meta/meta-details.component';
import {MetaService} from './main/list/meta.service';
import {PriceComponent} from './main/list/details/inline/price/priceinline.component';

const routes: Routes = [
    {path: 'login', component: AuthComponent},
    {path: 'list', component: MainComponent},
    {path: '**', redirectTo: 'list?type=issue?id=0', pathMatch: 'full'}
];

@NgModule({
    declarations: [
        AppComponent,
        DetailsComponent,
        InlineComponent,
        StoryinlineComponent,
        ListComponent,
        SearchComponent,
        CoverinlineComponent,
        CreateComponent,
        AuthComponent,
        MainComponent,
        HeaderComponent,
        FooterComponent,
        MetaComponent,
        MetainlineComponent,
        MetaDetailsComponent,
        PriceComponent
    ],
    imports: [
        BrowserModule,
        NgbModule.forRoot(),
        HttpModule,
        FormsModule,
        ReactiveFormsModule,
        InfiniteScrollModule,
        RouterModule.forRoot(
            routes
        )
    ],
    providers: [
        DetailsService,
        ListService,
        CreateService,
        AutocompleteService,
        AuthService,
        MetaService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
