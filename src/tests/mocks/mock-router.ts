import { NavigationExtras, UrlTree } from '@angular/router';
import { of } from 'rxjs';

export class MockRouter {
  navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
    return Promise.resolve(true);
  }

  navigateByUrl(url: string | UrlTree, extras?: NavigationExtras): Promise<boolean> {
    return Promise.resolve(true);
  }

  createUrlTree(commands: any[], navigationExtras?: NavigationExtras): UrlTree {
    return {} as UrlTree;
  }

  url = '/dashboard';
  events = of();
  routerState = {
    root: {} as any,
  };
}

