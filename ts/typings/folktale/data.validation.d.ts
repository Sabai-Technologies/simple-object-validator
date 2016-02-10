// Type definitions for data.validation

declare interface SemiGroup {
    concat(c:SemiGroup):SemiGroup;
}

declare class Validation {

    // -- Constructors -----------------------------------------------------
    /**
     * Constructs a new `Validation[α, β]` structure holding a `Failure` value.
     *
     * @summary a → Validation[α, β]
     */
    static Failure(a:SemiGroup):Failure;

    /**
     * Constructs a new `Etiher[α, β]` structure holding a `Success` value.
     *
     * @summary β → Validation[α, β]
     */
    static Success(a:any):Success;


    // -- Conversions ------------------------------------------------------
    /**
     * Constructs a new `Validation[α, β]` structure from a nullable type.
     *
     * Takes the `Failure` case if the value is `null` or `undefined`. Takes the
     * `Success` case otherwise.
     *
     * @summary α → Validation[α, α]
     */
    static fromNullable(a:any):Validation;

    /**
     * Constructs a new `Either[α, β]` structure from a `Validation[α, β]` type.
     *
     * @summary Either[α, β] → Validation[α, β]
     */

    //TODO manage Either
    //static fromEither(a:Either):Validation<any,any>;


    // -- Predicates -------------------------------------------------------
    /**
     * True if the `Validation[α, β]` contains a `Failure` value.
     *
     * @summary Boolean
     */
    isFailure:boolean;

    /**
     * True if the `Validation[α, β]` contains a `Success` value.
     *
     * @summary Boolean
     */
    isSuccess:boolean;


    // -- Applicative ------------------------------------------------------
    /**
     * Creates a new `Validation[α, β]` instance holding the `Success` value `b`.
     *
     * `b` can be any value, including `null`, `undefined` or another
     * `Validation[α, β]` structure.
     *
     * @summary β → Validation[α, β]
     */
    static of(a:any):Validation;

    /**
     * Applies the function inside the `Success` case of the `Validation[α, β]` structure
     * to another applicative type.
     *
     * The `Validation[α, β]` should contain a function value, otherwise a `TypeError`
     * is thrown.
     *
     * @method
     * @summary (@Validation[α, β → γ], f:Applicative[_]) => f[β] → f[γ]
     */
    ap(b:Validation):Validation;

    // -- Functor ----------------------------------------------------------
    /**
     * Transforms the `Success` value of the `Validation[α, β]` structure using a regular
     * unary function.
     *
     * @method
     * @summary (@Validation[α, β]) => (β → γ) → Validation[α, γ]
     */
    map(fn:(n:any) => any):Validation;


    // -- Show -------------------------------------------------------------
    /**
     * Returns a textual representation of the `Validation[α, β]` structure.
     *
     * @method
     * @summary (@Validation[α, β]) => Void → String
     */
    toString():string;


    // -- Eq ---------------------------------------------------------------
    /**
     * Tests if an `Validation[α, β]` structure is equal to another `Validation[α, β]`
     * structure.
     *
     * @method
     * @summary (@Validation[α, β]) => Validation[α, β] → Boolean
     */
    isEqual(a:any):boolean;


    // -- Extracting and recovering ----------------------------------------
    /**
     * Extracts the `Success` value out of the `Validation[α, β]` structure, if it
     * exists. Otherwise throws a `TypeError`.
     *
     * @method
     * @summary (@Validation[α, β]) => Void → β         :: partial, throws
     * @see {@link module:lib/validation~Validation#getOrElse} — A getter that can handle failures.
     * @see {@link module:lib/validation~Validation#merge} — The convergence of both values.
     * @throws {TypeError} if the structure has no `Success` value.
     */
    get():any;

    /**
     * Extracts the `Success` value out of the `Validation[α, β]` structure. If the
     * structure doesn't have a `Success` value, returns the given default.
     *
     * @method
     * @summary (@Validation[α, β]) => β → β
     */
    getOrElse(a:any):any;

    /**
     * Transforms a `Failure` value into a new `Validation[α, β]` structure. Does nothing
     * if the structure contain a `Success` value.
     *
     * @method
     * @summary (@Validation[α, β]) => (α → Validation[γ, β]) → Validation[γ, β]
     */
    orElse(f:Function):any;

    /**
     * Returns the value of whichever side of the disjunction that is present.
     *
     * @summary (@Validation[α, α]) => Void → α
     */
    merge():any;


    // -- Folds and Extended Transformations -------------------------------
    /**
     * Applies a function to each case in this data structure.
     *
     * @method
     * @summary (@Validation[α, β]) => (α → γ), (β → γ) → γ
     */
    fold(f:Function, g:Function):any;

    /**
     * Catamorphism.
     *
     * @method
     * @summary (@Validation[α, β]) => { Success: α → γ, Failure: α → γ } → γ
     */
    cata<T>(v:{Sucess:(a:any)=>T, Failure:(a:any)=>T}):T;


    /**
     * Swaps the disjunction values.
     *
     * @method
     * @summary (@Validation[α, β]) => Void → Validation[β, α]
     */
    swap():Validation;

    /**
     * Maps both sides of the disjunction.
     *
     * @method
     * @summary (@Validation[α, β]) => (α → γ), (β → δ) → Validation[γ, δ]
     */
    bimap(g:(a:any[]) => any, f:Function):Validation;

    /**
     * Maps the failure side of the disjunction.
     *
     * @method
     * @summary (@Validation[α, β]) => (α → γ) → Validation[γ, β]
     */
    failureMap(f:Function):Validation;

    /**
     * Maps the failure side of the disjunction.
     *
     * @method
     * @deprecated in favour of {@link module:lib/validation~Validation#failureMap}
     * @summary (@Validation[α, β]) => (α → γ) → Validation[γ, β]
     */
    leftMap(f:Function):Validation;
}


declare class Success extends Validation {
    bimap(_:any, f:Function):Success;
}

declare class Failure extends Validation {
    fold(_:any, g:Function):SemiGroup;

    bimap(g:(a:any[]) => any, _:any):Failure;
}


declare module 'data.validation' {
    export = Validation;
}