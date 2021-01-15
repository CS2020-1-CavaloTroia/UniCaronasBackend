const driverController  = require('../../src/controllers/DriverController');

describe('Signin', () =>{
  it('deve cadastrar um motorista', async () => {
    const signinReturn = await driverController.signin({
      body:{
        name: "Michelly",
        googleUID: {}, 
        phoneNumber: "62999009900"
      },
    }, "test");
    
      console.log(signinReturn.name);

      expect(signinReturn.name).toBe('Michelly');
  });
});