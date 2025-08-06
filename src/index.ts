import mongomod from "./mongomod.js";

// Errors
import { MmValidationError } from './errors/validationError.js';
import { MmOperationError } from './errors/operationError.js';
import { MmControllerError } from "./errors/controllerError.js";
import { MmConnectionError } from "./errors/connectionError.js";

export default mongomod;
export { MmValidationError, MmOperationError, MmControllerError, MmConnectionError };