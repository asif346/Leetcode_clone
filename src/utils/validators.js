import validator from 'validator'

const validate = (data)=>{
    const mendatoryField = ['firstName', 'emailId', 'password']

    const Isallowed = mendatoryField.every((k)=>Object.keys(data).includes(k));

    if(!Isallowed)
    {
        throw new Error('some field missing');
    }

    if (!validator.isEmail(data.emailId)) 
    throw new Error("Invalid Email");

    if(!validator.isStrongPassword(data.password))
    {
        throw new Error('weak password or may be wrong password')
    }
}

export default validate;