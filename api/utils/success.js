export const CreatSuccess = (statusCode, successMesssage, data)=>{
    const successObj ={
        status: statusCode,
        message: successMesssage,
        data: data
    }
    return successObj;
}