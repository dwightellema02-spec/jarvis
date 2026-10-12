/**
 * JARVIS Phase 7 - Geometry & Trigonometry Solver
 * Covers 2D planar geometry (Pythagorean, Heron's formula, circles, polygons),
 * trigonometry (Law of Sines/Cosines, radian conversions), and 3D solid geometry (spheres, cylinders, cones, prisms).
 */

import { MathStep } from '../math.interface.js';

export interface GeometricResult {
  shape: string;
  properties: Record<string, number | string>;
  steps: MathStep[];
}

export class GeometrySolver {
  /**
   * Pythagorean Theorem: solves for missing leg or hypotenuse in a right triangle.
   */
  public solvePythagorean(params: { a?: number; b?: number; c?: number }): GeometricResult {
    const { a, b, c } = params;
    const steps: MathStep[] = [];

    steps.push({
      stepNumber: 1,
      title: 'Pythagorean Theorem Setup',
      expression: 'a^2 + b^2 = c^2',
      explanation: 'In a right triangle, the square of the hypotenuse is equal to the sum of the squares of the other two legs.',
      ruleApplied: 'Pythagorean Theorem',
    });

    if (c === undefined && a !== undefined && b !== undefined) {
      const cVal = Math.sqrt(a * a + b * b);
      steps.push({
        stepNumber: 2,
        title: 'Substitute Legs a and b',
        expression: `c^2 = (${a})^2 + (${b})^2 = ${a * a} + ${b * b} = ${a * a + b * b}`,
        explanation: `Square leg a (${a}^2 = ${a * a}) and leg b (${b}^2 = ${b * b}) and sum them.`,
        ruleApplied: 'Algebraic Substitution',
      });
      steps.push({
        stepNumber: 3,
        title: 'Compute Hypotenuse c',
        expression: `c = √(${a * a + b * b}) ≈ ${cVal.toFixed(4)}`,
        explanation: 'Take the square root to find hypotenuse length.',
        ruleApplied: 'Radical Extraction',
      });
      return {
        shape: 'Right Triangle',
        properties: { a, b, c: cVal },
        steps,
      };
    } else if (c !== undefined && a !== undefined && b === undefined) {
      if (c <= a) throw new Error('Hypotenuse c must be strictly greater than leg a.');
      const bSq = c * c - a * a;
      const bVal = Math.sqrt(bSq);
      steps.push({
        stepNumber: 2,
        title: 'Isolate Leg b',
        expression: `b^2 = c^2 - a^2 = (${c})^2 - (${a})^2 = ${c * c} - ${a * a} = ${bSq}`,
        explanation: 'Subtract a^2 from hypotenuse squared to isolate b^2.',
        ruleApplied: 'Subtraction Property of Equality',
      });
      steps.push({
        stepNumber: 3,
        title: 'Compute Leg b',
        expression: `b = √(${bSq}) ≈ ${bVal.toFixed(4)}`,
        explanation: 'Take the square root to find leg b length.',
        ruleApplied: 'Radical Extraction',
      });
      return {
        shape: 'Right Triangle',
        properties: { a, b: bVal, c },
        steps,
      };
    } else if (c !== undefined && b !== undefined && a === undefined) {
      if (c <= b) throw new Error('Hypotenuse c must be strictly greater than leg b.');
      const aSq = c * c - b * b;
      const aVal = Math.sqrt(aSq);
      steps.push({
        stepNumber: 2,
        title: 'Isolate Leg a',
        expression: `a^2 = c^2 - b^2 = (${c})^2 - (${b})^2 = ${c * c} - ${b * b} = ${aSq}`,
        explanation: 'Subtract b^2 from hypotenuse squared to isolate a^2.',
        ruleApplied: 'Subtraction Property of Equality',
      });
      steps.push({
        stepNumber: 3,
        title: 'Compute Leg a',
        expression: `a = √(${aSq}) ≈ ${aVal.toFixed(4)}`,
        explanation: 'Take the square root to find leg a length.',
        ruleApplied: 'Radical Extraction',
      });
      return {
        shape: 'Right Triangle',
        properties: { a: aVal, b, c },
        steps,
      };
    }

    throw new Error('Must provide exactly 2 sides of the right triangle to solve for the 3rd.');
  }

  /**
   * Heron's formula for any triangle given 3 side lengths (a, b, c).
   */
  public solveTriangleHeron(a: number, b: number, c: number): GeometricResult {
    if (a + b <= c || a + c <= b || b + c <= a) {
      throw new Error('Triangle inequality violated: sum of any 2 sides must be greater than the 3rd.');
    }

    const steps: MathStep[] = [];
    const perimeter = a + b + c;
    const s = perimeter / 2;

    steps.push({
      stepNumber: 1,
      title: 'Calculate Semi-perimeter (s)',
      expression: `s = (a + b + c) / 2 = (${a} + ${b} + ${c}) / 2 = ${perimeter} / 2 = ${s}`,
      explanation: 'Calculate half of the perimeter for use in Heron\'s formula.',
      ruleApplied: 'Semi-perimeter Definition',
    });

    const radicand = s * (s - a) * (s - b) * (s - c);
    const area = Math.sqrt(radicand);

    steps.push({
      stepNumber: 2,
      title: 'Apply Heron\'s Formula',
      expression: `Area = √[s(s - a)(s - b)(s - c)]\n     = √[${s}(${s - a})(${s - b})(${s - c})] = √(${radicand})`,
      explanation: 'Substitute semi-perimeter and side lengths into Heron\'s radicand.',
      ruleApplied: "Heron's Formula",
    });

    steps.push({
      stepNumber: 3,
      title: 'Compute Area',
      expression: `Area ≈ ${area.toFixed(4)} square units`,
      explanation: 'Evaluate the square root to get total planar area.',
      ruleApplied: 'Simplification',
    });

    return {
      shape: 'General Triangle',
      properties: { a, b, c, perimeter, semiPerimeter: s, area },
      steps,
    };
  }

  /**
   * Circle calculations: Radius, Diameter, Circumference, Area, Sector Area.
   */
  public solveCircle(radius: number, sectorAngleDeg?: number): GeometricResult {
    if (radius <= 0) throw new Error('Circle radius must be positive.');

    const steps: MathStep[] = [];
    const diameter = 2 * radius;
    const circumference = 2 * Math.PI * radius;
    const area = Math.PI * radius * radius;

    steps.push({
      stepNumber: 1,
      title: 'Circle Circumference',
      expression: `C = 2 * π * r = 2 * π * ${radius} ≈ ${circumference.toFixed(4)}`,
      explanation: 'Circumference represents the perimeter around the circular boundary.',
      ruleApplied: 'Circumference Formula: C = 2πr',
    });

    steps.push({
      stepNumber: 2,
      title: 'Circle Area',
      expression: `A = π * r^2 = π * (${radius})^2 = π * ${radius * radius} ≈ ${area.toFixed(4)}`,
      explanation: 'Area represents the two-dimensional region enclosed by the circle.',
      ruleApplied: 'Circle Area Formula: A = πr^2',
    });

    let sectorArea: number | undefined;
    if (sectorAngleDeg !== undefined) {
      sectorArea = (sectorAngleDeg / 360) * area;
      steps.push({
        stepNumber: 3,
        title: 'Sector Area Calculation',
        expression: `Sector Area = (θ / 360°) * A = (${sectorAngleDeg}° / 360°) * ${area.toFixed(4)} ≈ ${sectorArea.toFixed(4)}`,
        explanation: `Fraction of total circular area proportional to central angle ${sectorAngleDeg}°.`,
        ruleApplied: 'Sector Area Formula: (θ/360)πr^2',
      });
    }

    return {
      shape: 'Circle',
      properties: {
        radius,
        diameter,
        circumference,
        area,
        ...(sectorArea !== undefined ? { sectorAngleDeg, sectorArea } : {}),
      },
      steps,
    };
  }

  /**
   * Law of Cosines: c^2 = a^2 + b^2 - 2ab*cos(C)
   * Solves for side c given a, b, and angle C in degrees.
   */
  public solveLawOfCosines(a: number, b: number, angleCDeg: number): GeometricResult {
    const steps: MathStep[] = [];
    const radC = (angleCDeg * Math.PI) / 180;
    const cosC = Math.cos(radC);

    steps.push({
      stepNumber: 1,
      title: 'Law of Cosines Setup',
      expression: 'c^2 = a^2 + b^2 - 2ab * cos(C)',
      explanation: 'Relates three sides of any triangle with the cosine of the included angle.',
      ruleApplied: 'Law of Cosines',
    });

    const cSq = a * a + b * b - 2 * a * b * cosC;
    const c = Math.sqrt(cSq);

    steps.push({
      stepNumber: 2,
      title: 'Substitute Values',
      expression: `c^2 = (${a})^2 + (${b})^2 - 2(${a})(${b}) * cos(${angleCDeg}°) = ${a * a + b * b} - (${(2 * a * b * cosC).toFixed(4)}) = ${cSq.toFixed(4)}`,
      explanation: `Evaluate trigonometric cosine term and combine with sum of squares.`,
      ruleApplied: 'Trigonometric Evaluation',
    });

    steps.push({
      stepNumber: 3,
      title: 'Extract Side c',
      expression: `c = √(${cSq.toFixed(4)}) ≈ ${c.toFixed(4)}`,
      explanation: 'Square root yields the length of the opposite side c.',
      ruleApplied: 'Radical Simplification',
    });

    return {
      shape: 'Triangle (SAS)',
      properties: { a, b, angleCDeg, sideC: c },
      steps,
    };
  }

  /**
   * 3D Sphere: Surface Area and Volume
   */
  public solveSphere(radius: number): GeometricResult {
    if (radius <= 0) throw new Error('Sphere radius must be positive.');
    const surfaceArea = 4 * Math.PI * radius * radius;
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    const steps: MathStep[] = [
      {
        stepNumber: 1,
        title: 'Sphere Surface Area',
        expression: `SA = 4 * π * r^2 = 4 * π * (${radius})^2 = ${4 * radius * radius}π ≈ ${surfaceArea.toFixed(4)}`,
        explanation: 'Total outer surface area of the sphere.',
        ruleApplied: 'Sphere Surface Area: 4πr^2',
      },
      {
        stepNumber: 2,
        title: 'Sphere Volume',
        expression: `V = (4/3) * π * r^3 = (4/3) * π * (${radius})^3 = ${((4 / 3) * Math.pow(radius, 3)).toFixed(4)}π ≈ ${volume.toFixed(4)}`,
        explanation: 'Three-dimensional capacity enclosed by the spherical boundary.',
        ruleApplied: 'Sphere Volume: (4/3)πr^3',
      },
    ];

    return {
      shape: 'Sphere',
      properties: { radius, surfaceArea, volume },
      steps,
    };
  }

  /**
   * 3D Cylinder: Surface Area and Volume
   */
  public solveCylinder(radius: number, height: number): GeometricResult {
    if (radius <= 0 || height <= 0) throw new Error('Radius and height must be positive.');
    const lateralArea = 2 * Math.PI * radius * height;
    const baseArea = Math.PI * radius * radius;
    const totalSurfaceArea = lateralArea + 2 * baseArea;
    const volume = baseArea * height;

    const steps: MathStep[] = [
      {
        stepNumber: 1,
        title: 'Cylinder Base and Lateral Area',
        expression: `Base Area = π * r^2 = ${(baseArea / Math.PI).toFixed(4)}π\nLateral Area = 2 * π * r * h = 2 * π * ${radius} * ${height} ≈ ${lateralArea.toFixed(4)}`,
        explanation: 'Calculate 2 circular end caps and unrolled rectangular lateral mantle.',
        ruleApplied: 'Cylinder Components',
      },
      {
        stepNumber: 2,
        title: 'Total Surface Area',
        expression: `SA = 2πr(r + h) = 2 * π * ${radius} * (${radius + height}) ≈ ${totalSurfaceArea.toFixed(4)}`,
        explanation: 'Sum of both base disks and the lateral area.',
        ruleApplied: 'Cylinder Surface Area Formula',
      },
      {
        stepNumber: 3,
        title: 'Cylinder Volume',
        expression: `V = π * r^2 * h = π * (${radius})^2 * ${height} = ${(radius * radius * height).toFixed(4)}π ≈ ${volume.toFixed(4)}`,
        explanation: 'Product of cross-sectional base area and height.',
        ruleApplied: 'Cylinder Volume Formula: V = πr^2h',
      },
    ];

    return {
      shape: 'Cylinder',
      properties: { radius, height, lateralArea, totalSurfaceArea, volume },
      steps,
    };
  }

  /**
   * 3D Cone: Slant Height, Lateral Area, Total Surface Area, Volume
   */
  public solveCone(radius: number, height: number): GeometricResult {
    if (radius <= 0 || height <= 0) throw new Error('Radius and height must be positive.');
    const slantHeight = Math.sqrt(radius * radius + height * height);
    const lateralArea = Math.PI * radius * slantHeight;
    const totalSurfaceArea = Math.PI * radius * (radius + slantHeight);
    const volume = (1 / 3) * Math.PI * radius * radius * height;

    const steps: MathStep[] = [
      {
        stepNumber: 1,
        title: 'Calculate Slant Height (l)',
        expression: `l = √(r^2 + h^2) = √(${radius}^2 + ${height}^2) = √(${radius * radius + height * height}) ≈ ${slantHeight.toFixed(4)}`,
        explanation: 'Apply Pythagorean theorem on internal right triangle formed by r, h, and l.',
        ruleApplied: 'Slant Height Formula',
      },
      {
        stepNumber: 2,
        title: 'Total Surface Area',
        expression: `SA = πr(r + l) = π * ${radius} * (${radius} + ${slantHeight.toFixed(4)}) ≈ ${totalSurfaceArea.toFixed(4)}`,
        explanation: 'Sum of circular base area and conic lateral curved area.',
        ruleApplied: 'Cone Surface Area: πr^2 + πrl',
      },
      {
        stepNumber: 3,
        title: 'Cone Volume',
        expression: `V = (1/3) * π * r^2 * h = (1/3) * π * (${radius})^2 * ${height} ≈ ${volume.toFixed(4)}`,
        explanation: 'One-third of corresponding cylinder volume.',
        ruleApplied: 'Cone Volume: (1/3)πr^2h',
      },
    ];

    return {
      shape: 'Cone',
      properties: { radius, height, slantHeight, lateralArea, totalSurfaceArea, volume },
      steps,
    };
  }
}
