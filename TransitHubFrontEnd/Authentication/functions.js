
export const CheckPasswordValidity = (password) => {
    var isValid = true;
    if(password.trim() !== '') {
      const minLength = 8;
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasSpecialChar = /[-_!@#$%^&*(),.?":{}|<>]/.test(password);
      isValid = password.length >= minLength && hasUppercase && hasLowercase && hasSpecialChar;
      console.log(password);
      return(isValid);
    } else {
      return(true);
    }
};


export const temporaryBullshit = (input) => {
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
};
// export const temporaryBullshit2 = (input) => {
//     const [strength, setStrength] = useState(''); 
 
//     if (newSuggestions.length === 0) { 
//         setStrength('Very Strong'); 
//     } else if (newSuggestions.length <= 1) { 
//         setStrength('Strong') 
//     } else if (newSuggestions.length <= 2) { 
//         setStrength('Moderate') 
//     } else if (newSuggestions.length <= 3) { 
//         setStrength('Weak') 
//     } else { 
//         setStrength('Too Weak') 
//     }
//     return
// };