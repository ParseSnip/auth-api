const FtoCelsius = (temp) =>{
    return( temp -32)/1.9
}

const CtoFahren = (temp)=>{
    return (temp*1.8) +32
}
module.exports={
    FtoCelsius,
    CtoFahren
}