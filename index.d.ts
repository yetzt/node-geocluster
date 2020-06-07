export as namespace geocluster;
export = geocluster;

interface Result {
    centroid: number[];
    elements: number[][];
}

declare function geocluster (elements: number[][], bias: number): Result[];
