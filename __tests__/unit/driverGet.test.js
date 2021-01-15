const driverController  = require('../../src/controllers/DriverController');

describe('Get', () =>{
  it('deve retornar um motorista', async () => {
    await driverController.signin({
      body:{
        name: "Maria",
        googleUID: {},
        phoneNumber: "62994949494",
      }
    }, "test");
    
    const user = await driverController.getUser({ 
      body:{
        phoneNumber: "62994949494", 
        googleUID: {},
      }
    }, "test");

      expect(user.phoneNumber).toBe("62994949494");
  });
});