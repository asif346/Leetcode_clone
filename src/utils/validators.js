import validator from 'validator'

const validate = (data)=>{
    const mendatoryField = ['firstName', 'email', 'password']

    const Isallowed = mendatoryField.every((k)=>Object.keys(data).includes(k));

    if(!Isallowed)
    {
        throw new Error('some field missing');
    }

    if(!validator.isEmail(data.email))
        throw new Error('Invalid Email');

    if(!validator.isStrongPassword(data.password))
    {
        throw new Error('wrong password')
    }
}

export default validate;