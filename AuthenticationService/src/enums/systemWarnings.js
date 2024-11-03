

//Creating custom warnings
const SysWarn = Object.freeze({
    MISSING_JWT_TOKEN: 'Unauthorized: Missing token',
    INVALID_JWT_TOKEN: 'Unauthorized: Invalid token',
    USER_TYPE_NOT_AUTHORIZED: 'Unauthorized: User does not have authorization to perform this action'
})

module.exports = SysWarn
