import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

import { paths } from '../../shared/utilities';

@Injectable({
  providedIn: 'root',
})
export class PathResolveService
  implements Resolve<string | Array<string> | null> {
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): string | Array<string> | null {
    const currentPath: string = state.url.replace('/', ''); // current URL entered
    const postdId: string | null = route.paramMap.get('postId');
    const valuesPath: Array<string> = Object.values(paths).filter(
      (item: string) => !item.includes(currentPath)
    );

    let getPath: string = valuesPath[this.getRandomInt(valuesPath.length)];
    getPath = postdId ? `${getPath}/:postId` : getPath;

    return valuesPath.length ? [`/${getPath}`, `${currentPath}`] : null;
  }

  private getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
  }
}
