const inquirer = require('inquirer');
const db = require('./db/queries');

function mainMenu() {
  inquirer
    .prompt({
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a new department",
        "Add new role",
        "Add a new employee",
        "Update an employee's role",
        "Exit",
      ],
    })
    .then((response) => {
      switch (response.action) {
        case "View all departments":
          return viewAllDepartments();
        case "View all roles":
          return viewAllRoles();
        case "View all employees":
          return viewAllEmployees();
        case "Add a new department":
          return addDepartment();
        case "Add new role":
          return addRole();
        case "Add a new employee":
          return addEmployee();
        case "Update an employee's role":
          return updateEmployeeRole();
        case "Exit":
          console.log("Done");
          process.exit();
      }
    });
  function viewAllDepartments() {
    db.viewAllDepartments()
      .then(([departments]) => {
        console.table(departments);
        mainMenu();
      })
      .catch((err) => {
        console.log(err);
        mainMenu();
      });
  }
  function viewAllRoles() {
    db.viewAllRoles()
      .then(([roles]) => {
        console.table(roles);
        mainMenu();
      })
      .catch((err) => {
        console.log(err);
        mainMenu();
      });
  }
  function viewAllEmployees() {
    db.viewAllEmployees()
      .then(([employees]) => {
        console.table(employees);
        mainMenu();
      })
      .catch((err) => {
        console.log(err);
        mainMenu();
      });
  }

  function addDepartment() {
    inquirer
      .prompt({
        type: "input",
        name: "departmentName",
        message: "Input the name of the new department?",
      })
      .then((response) => {
        db.addDepartment(response.departmentName)
          .then(() => {
            console.log(`Added new department: ${response.departmentName}`);
            mainMenu();
          })
          .catch((err) => {
            console.log(err);
            mainMenu();
          });
      });
  }

  function addRole() {
    inquirer.prompt({
      type: 'input',
      name: 'title',
      message: 'Input the title of the new role?',
    })
    .then((titleAnswer) => {
        let title = titleAnswer.title;
        return inquirer.prompt({
          type: 'input',
          name: 'salary',
          message: 'Input the salary of the new role?',
        })
        .then((salaryAnswer) => {
            let salary = salaryAnswer.salary;
            return db.viewAllDepartments()
            .then(([departments]) => {
                let departmentChoices = departments.map((department) => {
                    return {name: department.name, value: department.id};
                });
                return inquirer.prompt([
                  {type: 'list', 
                  name: 'department_id',  
                  message: 'What department is the new role in?', 
                  choices: departmentChoices},
                ])
                .then((departmentAnswer) => {
                    let department_id = departmentAnswer.department_id;
                    const newRole = {
                        title: title,
                        salary: salary,
                        department_id: department_id
                    };
                    return db.addRole(newRole);
                });
            });
        });
    })
    .then(() => {
        console.log("New role added successfully!");
        mainMenu();
    })
    .catch((error) => {
        console.log(`An error occurred: ${error.message}`);
        mainMenu();
    });
  }

  function addEmployee() {
    inquirer
      .prompt([
        {
          type: "input",
          name: "first_name",
          message: "Input the first name of the new employee?",
        },
        {
          type: "input",
          name: "last_name",
          message: "Input the last name of the new employee?",
        },
      ])
      .then((answers) => {
        let firstName = answers.first_name;
        let lastName = answers.last_name;
        return db.getAllRoles().then(([roles]) => {
          let roleChoices = roles.map((role) => {
            return { name: role.title, value: role.id };
          });
          return inquirer
            .prompt([
              {
                type: "list",
                name: "role_id",
                message: "Input the employee`s role?",
                choices: roleChoices,
              },
            ])
            .then((roleAnswer) => {
              let role_id = roleAnswer.role_id;
              return db.getAllEmployees().then(([employees]) => {
                let managerChoices = employees.map((employee) => {
                  return {
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id,
                  };
                });
                managerChoices.push({ name: "No Manager", value: null });
                return inquirer
                  .prompt([
                    {
                      type: "list",
                      name: "manager_id",
                      message: "Input the employee`s manager?",
                      choices: managerChoices,
                    },
                  ])
                  .then((managerAnswer) => {
                    let manager_id = managerAnswer.manager_id;
                    const newEmployee = {
                      first_name: firstName,
                      last_name: lastName,
                      role_id: role_id,
                      manager_id: manager_id,
                    };
                    return db.addEmployee(newEmployee);
                  });
              });
            });
        });
      })
      .then(() => {
        console.log("New employee added successfully!");
        mainMenu();
      })
      .catch((error) => {
        console.log(`An error occurred: ${error.message}`);
        mainMenu();
      });
  }
}

function updateEmployeeRole() {
  db.getAllEmployees ()
    .then(([employees]) => {
      let employeeChoice = employees.map((employee) => {
        return {name: employee.first_name + " " + employee.last_name, value: employee.id};
      });
      return inquirer.prompt ([
        {type: 'list', name: 'updateEmployee', message: 'Which employee`s role do you want to update?', choices: employeeChoice},
      ]);
    })
    .then((answers) => {
      let employeeId = answers.updateEmployee;
      return db.getAllRoles() 
        .then(([roles]) => {
          let roleChoices = roles.map((role) => {
              return {name: role.title, value: role.id};
          });    
          return inquirer.prompt([
            {type: 'list', name: 'new_role_id', message: 'What is the employee`s new role?', choices: roleChoices},
          ])
          .then((roleAnswer) => {
            let newRoleId = roleAnswer.new_role_id;
            const updatedEmployee = {
              id: employeeId,
              role_id: newRoleId
            };
            console.log(`Updating role for employee ID ${employeeId} to new role ID ${newRoleId}`);
            return db.updateEmployeeRole(updatedEmployee);
          });
        })
        .then(() => {
          console.log("Employee role updated successfully!");
          mainMenu();
        })
        .catch((error) => {
          console.log(`An error occurred: ${error.message}`);
          mainMenu();
        });
    });
}

mainMenu();