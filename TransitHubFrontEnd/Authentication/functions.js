
export const CheckPasswordValidity = (input) => {
    const hasWhitespace = input.includes(' ');
    if (hasWhitespace) {
        return('no white space maderpaker');
    }
    if (input.length < 8) { 
        return('Password should be at least 8 characters long');
    } 
    if (!/\d/.test(input)) { 
        return('Add at least one number');
    } 
    if (!/[A-Z]/.test(input) || !/[a-z]/.test(input)) { 
        return('Include both upper and lower case letters');
    } 
    if (!/[^A-Za-z0-9]/.test(input)) { 
        return('Include at least one special character') ;
    }
    return true; 
};
