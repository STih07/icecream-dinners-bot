import { Observable, ObservableInput, OperatorFunction, ObservedValueOf, from } from "rxjs";
import { switchMap, mapTo } from "rxjs/operators";

// TODO: rewrite with OperatorFunction
export function switchNill<T, R, O extends ObservableInput<any>>(
    project: (value: T, index: number) => O
) {
    return (source: Observable<T>) => source.pipe(
        switchMap(((a, i) => from(project(a, i)).pipe(mapTo(a))))
    );
}

// function switchNill<R>(dataProducer: (data: R) => ObservableInput<R>): OperatorFunction<R> {
//     return input$ => input$.pipe(
//       switchMap((value: R) => dataProducer(value).pipe(
//           mapTo(value)
//         ))
//     );  
//   }