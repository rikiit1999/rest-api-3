require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const port = process.env.PORT;
const con = process.env.CONNECTION;

const app = express();

const Employee = require('./models/Employee');
const bcrypt = require('bcryptjs');

try {
    mongoose.connect(con);    
    console.log('Connected!');
} 
catch (error) {
    handleError(error);
    console.log('Error: ', error);
}

app.use(express.json());

app.get('/', (req, res) => {
    res.send('GET request to the homepage');    
});

// register
app.post('/api/register', async (req, res) => {        
    try {
        const { fullname, phoneNumber, email, username, password } = req.body;

        // Hash the password before saving it to the database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (!fullname || !phoneNumber || !email || !username  || !password ) {
            return res.status(404).json({message: 'Vui lòng điền đẩy đủ thông tin', error: 'Not found'});
        }

        const checkUsername = await Employee.findOne({ username });
        if (checkUsername) {
            return res.status(200).json({message: 'username đã tồn tại'});
        }
        else {
            //const result = await Employee.create(req.body);          
            const result = await Employee.create({fullname, phoneNumber, email, username, password: hashedPassword});          
        
            return res.status(200).json({message: 'Đăng ký thành công', result: result}); 
        }                   
    }
    catch (error) {
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    };
});

// login
app.get('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username && !password) {
            return res.status(404).json({message: 'Vui lòng điền đẩy đủ thông tin', error: 'Not found'});
        }    
        else {
            const checkUsername = await Employee.findOne({ username });
            if (!checkUsername) return res.status(404).json({message: 'thất bại', error: 'sai thông tin'});

            const checkPassword = await bcrypt.compare(password, checkUsername.password);

            if (!checkPassword) return res.status(404).json({message: 'thất bại', error: 'sai thông tin pass'});
            
            return res.status(200).json( {message: 'Đăng nhập thành công'} );            
        }                
    }
    catch (error) {
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    };
});

// delete users
app.delete('/api/delete-users', async (req, res) => {
    try {
        const { username } = req.query;
        const checkUsername = await Employee.find({ username });
 
        if (checkUsername.length == 0) {
            return res.status(404).json({message: 'Không tìm thấy username', error: 'Not found'});
        }
        else {
            const username = req.query.username;                                                                             
            
            const result = await Employee.deleteMany({ username: username });            

            return res.status(200).json({message: `Xóa thành công: ${result.deletedCount}/${checkUsername.length}`, result: result});
        }        
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    }
});

// get list all of users by filter
app.get('/api/get-all-users', async (req, res) => {
    try {
        //const result = await Employee.find(req.query);            
        //return res.status(200).json({message: 'Lấy ra danh sách người dùng (theo filter) thành công', result: result});
        const searchFields = {};

        if (req.query.fullname) {
            searchFields.fullname = req.query.fullname;
        }
        if (req.query.phoneNumber) {
            searchFields.phoneNumber = req.query.phoneNumber;
        }
        if (req.query.email) {
            searchFields.email = req.query.email;
        }
        if (req.query.username) {
            searchFields.username = req.query.username;
        }

        // let page = req.query.page;
        let page = parseInt( req.query.page );
        let pageSize = parseInt ( req.query.pageSize );
        let result;        

        // if (page) {
        //     if (page == 1){
        //         page = 1;
        //     }
        // } 
        
        const skip = (page - 1) * pageSize;       
        console.log('skip: ', skip);        
        console.log('pageSize: ', pageSize);    

        result = await Employee.find( searchFields ).sort( { 'createdAt': 1 } ).skip( skip ).limit( pageSize );
        return res.status(200).json({message: 'Lấy ra danh sách người dùng (theo filter) thành công', result: result});
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    }
});

// Activate account (isActive: 0/1), default: 0
app.patch('/api/activate', async (req, res) => {
    try {
        const username = await Employee.findOne({ username: req.query.username }).exec();
        console.log('username: ', username);

        if (!username) {
            return res.status(404).json({message: 'Không tìm thấy user để kích hoạt', error: 'Not found'});
        }                
        
        // if (username.isActive == 1) {
        //     const conditions = await Employee.findOne({ username: req.query.username }).exec();
        //     const update = await Employee.updateOne(conditions, { isActive: 0 });            
        //     return res.status(200).json({message: 'Thay đổi isActive thành công', result: update});            
        // }

        const conditions = await Employee.findOne({ username: req.query.username }).exec();
        const update = await Employee.updateOne(conditions, { isActive: !username.isActive });        
        return res.status(200).json({message: 'Thay đổi isActive thành công', result: update});           
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    }
});

// Change password
app.patch('/api/change-password', async (req, res) => {
    try{
        const username = req.query.username;
        const checkUsername = await Employee.findOne({username: username}).exec();
        const password = req.body.password;

        // Hash the password before saving it to the database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        if (!checkUsername) {
            return res.status(404).json({message: 'Không tìm thấy username', error: 'Not found'});
        }
        const conditions = checkUsername;
        const update = await Employee.updateOne(conditions, { password: hashedPassword });
        
        return res.status(200).json( {message: 'Update password thành công', result: update});
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    }
});

// Update user in4
app.patch('/api/update-user', async (req, res) => {
    try {
        const usernameQuery = await Employee.findOne({ username: req.query.username }).exec();        

        if (!usernameQuery) {
            return res.status(404).json({message: 'Không tìm thấy user để update in4', error: 'Not found'});
        }

        const checkIsActive = usernameQuery.isActive;
        if (checkIsActive == 0) {
            return res.status(406).json({message: 'Tài khoản chưa được kích hoạt', error: 'Not Acceptable'});
        }

        const updateFields = {};
        
        if (req.body.fullname) {
            updateFields.fullname = req.body.fullname;
        }
        if (req.body.phoneNumber) {
            updateFields.phoneNumber = req.body.phoneNumber;
        }
        if (req.body.email) {
            updateFields.email = req.body.email;
        }
        if (req.body.username) {
            updateFields.username = req.body.username;
        }
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            updateFields.password = hashedPassword;
        }
                
        const result = await Employee.updateOne({ username: req.query.username }, updateFields);
        return res.status(200).json({message: 'Update thành công', result: result});           
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    }
});

// function trả về 1 array 
// nếu id 1->3 name + 'đẹp trai'
// nếu id 4->5 name + 'ko đẹp trai'
// function depTrai() {
//     const array1 = [
//         { id: 1, name: 'linus' },
//         { id: 2, name: 'vin' },
//         { id: 3, name: 'alex' },
//         { id: 4, name: 'bocha' },
//         { id: 5, name: 'riki' }
//     ];
    
//     let array2 = [];
    
//     array1.filter ( (item) => { if (item.id <= 3) 
//         array2.push( { [item.name]: 'đẹp trai' } ); 
//     });
//     array1.filter ( (item) => { if (item.id > 3) 
//         array2.push( { [item.name]: 'ko đẹp trai' } ); 
//     });

//     return array2;
// };

// const result = depTrai(); 
// console.log('result: ', result);

// expected output:
/*
[
  { linus: 'đẹp trai' },
  { vin: 'đẹp trai' },
  { alex: 'đẹp trai' },
  { bocha: 'không đẹp trai' },
  { riki: 'không đẹp trai' }
]
*/



// function Student(firstName, lastName) {
//     this.firstName = firstName;
//     this.lastName = lastName;
// };

// Student.prototype.getFullName = function() {
//     return this.firstName + " " + this.lastName
// };

// // Ví dụ khi sử dụng
// var student = new Student('Long', 'Bui');

// console.log(student.firstName);  // 'Long'
// console.log(student.lastName);  // 'Bui'
// console.log(student.getFullName()); 

// const d = new Date();
// let year = d.getFullYear() - 1;
// console.log('d: ', d);
// console.log('year: ', year);



// function getFirstElement (array) {
//     return array[0];
// }

// // Ví dụ sử dụng
// var animals = ['Monkey', 'Tiger', 'Elephant'];
// var result = getFirstElement(animals);

// console.log(result); // Expected: "Monkey"
// console.log(animals);


// // Làm bài tại đây
// function Student(firstName, lastName) {
//     this.firstName = firstName;
//     this.lastName = lastName;
// }


// Student.prototype.getFullName = function() {
//     return `${this.firstName} ${this.lastName}`;
// }
// var student = new Student('Long', 'Bui');
// console.log(student.firstName);  // 'Long'
// console.log(student.lastName);  // 'Bui'
// console.log(student.getFullName());  // 'Long Bui'

// function getNextYear () {
//     let date = new Date();
//     console.log('date: ', date);
//     let nextYear = date.getFullYear() + 1;
//     console.log('nextYear: ', nextYear);

//     return nextYear;
// };

// getNextYear ();

// var orders = [
//     {
//         name: 'Khóa học HTML - CSS Pro',
//         price: 3000000
//     },
//     {
//         name: 'Khóa học Javascript Pro',
//         price: 2500000
//     },
//     {
//         name: 'Khóa học React Pro',
//         price: 3200000
//     }
// ];

// function getTotal(orders) {
//     let sum = 0; 
    
//     for (var i = 0; i < orders.length; i ++) {        
//         sum += orders[i].price;
//     }

//     console.log('sum: ', sum);
//     return sum;
// };

// // function getTotal(orders) {
// //     var splitArray = [];
// //     let sum = 0;
// //     orders.forEach(function(obj){
// //         splitArray.push(obj.price);    
// //         sum += obj.price;
// //     });
// //     console.log('sum: ', sum);
// //     return sum;
// // };

// getTotal(orders);




// function run(object) {

// }

// var object = {
//     'name': 'Nguyen Van A',
//     'age': 16,
// };

// console.log(`Thuộc tính name có giá trị ${ object.name }`);
// console.log(`Thuộc tính age có giá trị ${ object.age }`);

// // sử dụng for...in truyền vào object

// function run (object) {
//     let array = [];
//     let string;

//     for (key in object) {
//         console.log(`Thuộc tính ${key} có giá trị ${object[key]}`);
//         array.push(`Thuộc tính ${key} có giá trị ${object[key]}`)
//         console.log('array: ', array);
//     }

//     return array;
// };

// run (object);

// const sports = [
//     {
//         name: 'Bóng rổ',
//         like: 6
//     },
//     {
//         name: 'Bơi lội',
//         like: 5
//     },
//     {
//         name: 'Bóng đá',
//         like: 10
//     },
// ];

// function getMostFavoriteSport() {
//     const result = sports.filter((sport) => sport.like > 5);

//     console.log(result);
// };

// console.log(getMostFavoriteSport(sports)) ;
// Expected output: [{ name: 'Bóng rổ, like: 6 }, { name: 'Bóng đá, like: 10 }]


function getTotalGold(sports) {
    const initialValue = 0;

    const totalValue = sports.reduce( (accumulator, currentItem) => {
        return accumulator + currentItem.gold;
    }, 0);

    return totalValue;
};

var sports = [
    {
        name: 'Bơi lội',
        gold: 11
    },
    {
        name: 'Boxing',
        gold: 3
    },
    {
        name: 'Đạp xe',
        gold: 4
    },
    {
        name: 'Đấu kiếm',
        gold: 5
    },
];

// Expected results:
// console.log(getTotalGold(sports)) // Output: 23

// const objects = [{ x: 1 }, { x: 2 }, { x: 3 }];
// const sum = objects.reduce(
//   (accumulator, currentValue) => accumulator + currentValue.x,
//   0,
// );

// console.log(sum); // 6




// var watchList = [
//     {
//       "Title": "Inception",
//       "Year": "2010",
//       "Rated": "PG-13",
//       "Released": "16 Jul 2010",
//       "Runtime": "148 min",
//       "Genre": "Action, Adventure, Crime",
//       "Director": "Christopher Nolan",
//       "Writer": "Christopher Nolan",
//       "Actors": "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy",
//       "Plot": "A thief, who steals corporate secrets through use of dream-sharing technology, is given the inverse task of planting an idea into the mind of a CEO.",
//       "Language": "English, Japanese, French",
//       "Country": "USA, UK",
//       "imdbRating": "8.8",
//       "imdbVotes": "1,446,708",
//       "imdbID": "tt1375666",
//       "Type": "movie",
//     },
//     {
//       "Title": "Interstellar",
//       "Year": "2014",
//       "Rated": "PG-13",
//       "Released": "07 Nov 2014",
//       "Runtime": "169 min",
//       "Genre": "Adventure, Drama, Sci-Fi",
//       "Director": "Christopher Nolan",
//       "Writer": "Jonathan Nolan, Christopher Nolan",
//       "Actors": "Ellen Burstyn, Matthew McConaughey, Mackenzie Foy, John Lithgow",
//       "Plot": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
//       "Language": "English",
//       "Country": "USA, UK",
//       "imdbRating": "8.6",
//       "imdbVotes": "910,366",
//       "imdbID": "tt0816692",
//       "Type": "movie",
//     },
//     {
//       "Title": "The Dark Knight",
//       "Year": "2008",
//       "Rated": "PG-13",
//       "Released": "18 Jul 2008",
//       "Runtime": "152 min",
//       "Genre": "Action, Adventure, Crime",
//       "Director": "Christopher Nolan",
//       "Writer": "Jonathan Nolan (screenplay), Christopher Nolan (screenplay), Christopher Nolan (story), David S. Goyer (story), Bob Kane (characters)",
//       "Actors": "Christian Bale, Heath Ledger, Aaron Eckhart, Michael Caine",
//       "Plot": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, the caped crusader must come to terms with one of the greatest psychological tests of his ability to fight injustice.",
//       "Language": "English, Mandarin",
//       "Country": "USA, UK",
//       "imdbRating": "9.0",
//       "imdbVotes": "1,652,832",
//       "imdbID": "tt0468569",
//       "Type": "movie",
//     },
//     {
//       "Title": "Batman Begins",
//       "Year": "2005",
//       "Rated": "PG-13",
//       "Released": "15 Jun 2005",
//       "Runtime": "140 min",
//       "Genre": "Action, Adventure",
//       "Director": "Christopher Nolan",
//       "Writer": "Bob Kane (characters), David S. Goyer (story), Christopher Nolan (screenplay), David S. Goyer (screenplay)",
//       "Actors": "Christian Bale, Michael Caine, Liam Neeson, Katie Holmes",
//       "Plot": "After training with his mentor, Batman begins his fight to free crime-ridden Gotham City from the corruption that Scarecrow and the League of Shadows have cast upon it.",
//       "Language": "English, Urdu, Mandarin",
//       "Country": "USA, UK",
//       "imdbRating": "8.3",
//       "imdbVotes": "972,584",
//       "imdbID": "tt0372784",
//       "Type": "movie",
//     },
//     {
//       "Title": "Avatar",
//       "Year": "2009",
//       "Rated": "PG-13",
//       "Released": "18 Dec 2009",
//       "Runtime": "162 min",
//       "Genre": "Action, Adventure, Fantasy",
//       "Director": "James Cameron",
//       "Writer": "James Cameron",
//       "Actors": "Sam Worthington, Zoe Saldana, Sigourney Weaver, Stephen Lang",
//       "Plot": "A paraplegic marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.",
//       "Language": "English, Spanish",
//       "Country": "USA, UK",
//       "imdbRating": "7.9",
//       "imdbVotes": "876,575",
//       "imdbID": "tt0499549",
//       "Type": "movie",
//     }
//   ];

//   const filmResult = watchList.filter((item) => item.Director === 'Christopher Nolan');
//   const totalImdbRating = filmResult.reduce(
//     (accumulator, currentValue) => accumulator + parseFloat(currentValue.imdbRating),
//     0,
//   );
//   const totalFilmResult = filmResult.length; 
//    const avgImdbResult = totalImdbRating / totalFilmResult;

//   function calculateRating (avgImdbResult) {      
//     return avgImdbResult;    
//   };
  
//   // Expected results
//   console.log(calculateRating(filmResult)); // Output: 8.675

// console.log('totalImdbRating: ', totalImdbRating);
// console.log('avgImdbResult: ', totalFilmResult);
// console.log('avgImdbVotes: ', avgImdbResult);




function arrToObj ( arr ) {

};
 
// Expected results:
var arr = [
    ['name', 'Sơn Đặng'],
    ['age', 18],
];
// console.log(arrToObj(arr)); // { name: 'Sơn Đặng', age: 18 }

// var arr2 = [];
// arr2 = arr.flat();

// console.log('arr2: ', arr2);
 
// console.log(`{ ${arr2[0]}: ${arr2[1]}, ${arr2[2]}: ${arr2[3]} }`);



// const mapper = new Map([
//     ["1", "a"],
//     ["2", "b"],
//   ]);
//   Array.from(mapper.values());
//   // ['a', 'b'];
  
//   Array.from(mapper.keys());
//   // ['1', '2'];

// console.log(Array.from(mapper.keys()));

// Array.from({ length: 10 }, (v, i) => i);
// console.log(Array.from({ length: 10 }, (v, i) => i));
// // [0, 1, 2, 3, 4]

// Array.from({ length: 5 }, (v, i) => String.fromCharCode(97 + i));
// console.log(Array.from({ length: 5 }, (v, i) => String.fromCharCode(97 + i)));
// // ['a', 'b', 'c', 'd', 'e']

let students = [
    { id: 1, name: "Alice", age: 20, grades: [80, 85, 90, 78, 92] },
    { id: 2, name: "Bob", age: 22, grades: [75, 80, 85, 70, 65] },
    { id: 3, name: "Charlie", age: 21, grades: [95, 100, 98, 92, 88] },
    { id: 4, name: "David", age: 19, grades: [50, 60, 70, 65, 75] },
    { id: 5, name: "Eve", age: 23, grades: [85, 90, 88, 95, 92] }
];

let newArrayTest = [
    { id: 1, name: "Alice", age: 20, grades: [80, 85, 90, 78, 92], avgGrade: 85},
    { id: 2, name: "Bob", age: 22, grades: [75, 80, 85, 70, 65], avgGrade: 75},
    { id: 3, name: "Charlie", age: 21, grades: [95, 100, 98, 92, 88], avgGrade: 94.6 },
    { id: 4, name: "David", age: 19, grades: [50, 60, 70, 65, 75], avgGrade: 64},
    { id: 5, name: "Eve", age: 23, grades: [85, 90, 88, 95, 92], avgGrade: 90 }
];

let school = {
    teachers: ["Mr. John", "Ms. Lisa", "Mr. Adam"],
    students: ["Alice", "Bob", "Charlie"],
    grades: {
      Alice: [80, 85, 90],
      Bob: [75, 80, 70],
      Charlie: [85, 95, 92]
    }
};

let products = [
    { id: 1, name: "Laptop", quantity: 30, price: 1000 },
    { id: 2, name: "Phone", quantity: 50, price: 500 },
    { id: 3, name: "Tablet", quantity: 20, price: 600 },
    { id: 4, name: "Monitor", quantity: 15, price: 300 },
    { id: 5, name: "Keyboard", quantity: 100, price: 50 }
];

let orders = [
    {
      orderId: 1,
      customer: "Alice",
      items: [
        { productId: 1, quantity: 1 }, // Laptop
        { productId: 5, quantity: 2 }  // Keyboard
      ]
    },
    {
      orderId: 2,
      customer: "Bob",
      items: [
        { productId: 2, quantity: 3 }, // Phone
        { productId: 4, quantity: 1 }  // Monitor
      ]
    },
    {
      orderId: 3,
      customer: "Charlie",
      items: [
        { productId: 3, quantity: 2 }, // Tablet
        { productId: 1, quantity: 1 }  // Laptop
      ]
    }
];

// Bài 1: Tính điểm trung bình của mỗi sinh viên trong mảng students 
// và thêm thuộc tính averageGrade vào từng object.

// students.forEach( (item) => {
//     let totalGrades = item.grades.reduce( (previousValue, currentValue) =>  (previousValue + currentValue), 0);
//     //let avgGrades = totalGrades / item.grades.length;
//     item.avgGrades = totalGrades / item.grades.length;
// })
// console.log(students);


// Bài 2: Lấy tên của tất cả sinh viên có điểm trung bình lớn hơn 80 trong object school.
//1. truy cập object grades, sử dụng for in duyệt key
//2. mảng.reduce cộng dồn điểm / trung bình
//3. nếu trung bình > 80 -> push vào mảng mới
//4. return cho nó và gọi lại vào function

// function newFunction (school) {
//     let totalGrades = 0;
//     let arrayGrades = [];
//     let avgGrades = 0;
//     let newArray = [];

//     for (key in school.grades) {
//         arrayGrades = school.grades[key];
//         totalGrades = arrayGrades.reduce((previousValue, currentValue) => (previousValue + currentValue), 0);
//         avgGrades = totalGrades / arrayGrades.length;
        
//         if (avgGrades > 80) {
//             newArray.push(key);
//             newArray.push(avgGrades);
//         }
//     }
//     console.log(newArray);
//     return newArray;
    
// }

// newFunction (school);


// Bài 3: Thêm một giáo viên mới vào danh sách teachers 
// và kiểm tra xem có tồn tại sinh viên tên "David" trong danh sách students không.

// school.teachers.push('Mr.Riki');
// if (!school.students.includes('Bob')) {
//     console.log('ko có');
//     return;
// }
// console.log('có');
// return;


// Bài 4: Sắp xếp mảng students theo tuổi tăng dần.
// function compareNumbers(a, b) {
//     return a - b;
// };
// let arrayAge = [];
// // truy cập age, gán value of ages ra 1 mảng mới
// students.forEach( (item) => {
//     arrayAge.push(item.age);
// });

// arrayAge = arrayAge.sort();
// console.log(arrayAge);
// students = students.sort((a, b) => a.age - b.age);
// console.log(students);


//Bài 5: Tính tổng điểm của từng học sinh trong object school.grades 
//và lưu kết quả vào một object mới.
// let arrayGrades;
// let totalGrades = 0;
// let newObject = {};
// for(key in school.grades) {       
//     totalGrades = school.grades[key].reduce((previousValue, currentValue) => (previousValue + currentValue), 0);
//     newObject[key] = totalGrades;
// }
// console.log('new object: ', newObject);





// const initialValue = 0;
// students.forEach( (item) => {
//     // tính tổng điểm của grades = sum
//     let sumGrades = item.grades.reduce( (previouseValue, currentValue) => (previouseValue + currentValue), initialValue);

//     // tính điểm trung bình = sum / grades[].length
//     let avgGrades = sumGrades / item.grades.length;

//     // thêm key averageGrade và value của nó là sum / grades[].length vào mảng students
//     item.avgGrades = avgGrades;
// });

// console.log(students);



// Bài 1: Quản lý sinh viên và tính toán thống kê điểm
// Bạn có một mảng students chứa thông tin sinh viên bao gồm tên, tuổi và danh sách điểm của họ. Hãy viết các hàm thực hiện các yêu cầu sau:
// Yêu cầu:
// 1. Tính điểm trung bình của từng sinh viên và thêm thuộc tính averageGrade vào object của họ.
// 2. Lọc ra danh sách sinh viên có điểm trung bình trên 80.
// 3. Tìm sinh viên có điểm trung bình cao nhất và trả về tên của họ.
// 4. Sắp xếp danh sách sinh viên theo điểm trung bình giảm dần.
// 5. Tính điểm trung bình của toàn bộ lớp.

// 1. Tính điểm trung bình của từng sinh viên và thêm thuộc tính averageGrade vào object của họ.
// 2. Lọc ra danh sách sinh viên có điểm trung bình trên 80.
// let avgGrade = 0;
// let newArray = [];
// students.forEach(item => {
//     avgGrade = item.grades.reduce((previousValue, currentValue) => (previousValue + currentValue), 0) / item.grades.length;    
//     if (avgGrade > 80)  {
//         item.avgGrade = avgGrade;
//         newArray.push(item);
//     } 
// });


// // 3. Tìm sinh viên có điểm trung bình cao nhất và trả về tên của họ.
// if (newArrayTest.length === 0) {
//     console.log("No students in the list.");
// } 
// else {
//     let bestStudent = newArrayTest.reduce((prev, curr) => (curr.avgGrade > prev.avgGrade ? curr : prev));
//     console.log("type of bestStudent:", typeof(bestStudent));
//     console.log("bestStudent:", bestStudent);
// }

// 4. Sắp xếp sinh viên theo điểm trung bình giảm dần
// let newstudents = [];
// newstudents = newArrayTest.sort((a, b) => b.avgGrade - a.avgGrade);
// console.log(": ");
// console.log("newstudents: ", newstudents);

// 5. Tính điểm trung bình toàn bộ lớp
// let classAvgGrades = newArrayTest.reduce((sum, currentValue) => sum + currentValue.avgGrade, 0) / newArrayTest.length;
// console.log("classAvgGrades:", classAvgGrades);



// Bài 2: Quản lý kho hàng
// Bạn quản lý một kho hàng và có dữ liệu về các sản phẩm dưới dạng mảng các object. 
// Mỗi sản phẩm có mã sản phẩm (id), tên, số lượng tồn kho và giá bán. 
// Hãy viết các hàm thực hiện các yêu cầu sau:
// Yêu cầu:
// 1. Tính tổng giá trị tồn kho của toàn bộ sản phẩm (số lượng * giá bán).
// 2. Lọc ra những sản phẩm có số lượng tồn kho dưới 20.
// 3. Sắp xếp danh sách sản phẩm theo giá bán từ cao đến thấp.
// 4. Tìm sản phẩm có giá trị tồn kho cao nhất (số lượng * giá bán).
// 5. Tìm sản phẩm có giá bán thấp nhất và sản phẩm có giá bán cao nhất.

// 1. Tính tổng giá trị tồn kho của toàn bộ sản phẩm (số lượng * giá bán).
// let inventoryValue;
// let sum = 0;
// products.forEach( (item) => {
//     sum += item.quantity*item.price;
// })
// console.log('sum: ', sum);


// 2. Lọc ra những sản phẩm có số lượng tồn kho dưới 20.
// products.forEach ( (item) => {
//     if (item.quantity < 20) {
//         console.log(item);
//     } 
// })


// 3. Sắp xếp danh sách sản phẩm theo giá bán từ cao đến thấp.
// let arraySort = products.sort( (a,b) => b.price - a.price);
// console.log('arraySort: ', arraySort);


// 4. Tìm sản phẩm có giá trị tồn kho cao nhất (số lượng * giá bán).
// let mostValuableProduct = products.reduce((prev, curr) => (curr.quantity * curr.price > prev.quantity * prev.price ? curr : prev), products[0]);
// console.log("type of mostValuableProduct:", (mostValuableProduct));
// console.log("mostValuableProduct:", mostValuableProduct.name);


// 5. Tìm sản phẩm có giá bán thấp nhất và sản phẩm có giá bán cao nhất.
// let cheapestPriceProduct = products.reduce((prev, curr) => ( curr.price < prev.price ? curr : prev), products[0]);
// console.log('minPriceProduct: ', cheapestPriceProduct.name);
// let highestPriceProduct = products.reduce((prev, curr) => ( curr.price > prev.price ? curr : prev), products[0]);
// console.log('minPriceProduct: ', highestPriceProduct.name);


// Bài 3: Quản lý đơn hàng
// Bạn có một danh sách đơn hàng và mỗi đơn hàng chứa thông tin về khách hàng, 
// danh sách các sản phẩm được đặt và số lượng tương ứng. 
// Viết các hàm để xử lý các yêu cầu sau:
// Yêu cầu:
// 1. Tính tổng giá trị của mỗi đơn hàng
// 2. Lọc ra các đơn hàng có tổng giá trị trên 2000.
// 3. Tìm khách hàng có tổng chi tiêu cao nhất.
// 4. Tìm ra sản phẩm được đặt nhiều nhất (tính tổng số lượng từ tất cả đơn hàng).



orders.forEach(order => {
    let totalValue = order.items.reduce((previousValue, item) => {
      let product = products.find(p => p.id === item.productId);
      return previousValue + item.quantity * product.price;
    }, 0);
    order.totalValue = totalValue;
  });
  
  //console.log("Orders with total value:", orders);
  console.log("Orders with total value:", JSON.stringify(orders, null, 2));



app.listen(port, () => {
    console.log(`Listening for requests on port: ${port}`);
});