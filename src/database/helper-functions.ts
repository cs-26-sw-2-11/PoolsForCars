import { promises as fsPromises } from 'fs';
import {join} from 'path';
import { json } from 'stream/consumers';

export async function asyncWriteFile(filename: string, data: any){
    try {
        await fsPromises.writeFile(join("src/database/", filename), data, {
            flag: 'w',
        });
    } catch (err) {
        console.log(err);
        return `Something went wrong while writing file ${join("src/database/", filename)}`;
    }
}

export async function asyncReadFile(filename: string){
    try {
        const contents: string = await fsPromises.readFile(
            join("src/database/", filename),
            'utf-8',
        );
        return contents;
    } catch (err) {
        console.log(err);
        return `Something went wrong while reading file ${join("src/database/", filename)}`;
    }
}


export async function asyncAppendLineToFile(filename: string, data: any){
    try {
        await fsPromises.appendFile(join("src/database/", filename), data + "\n");
    } catch (err) {
        console.log(err);
        return `Something went wrong while appending to file ${join("src/database/", filename)}`;
    }
}




// fsPromises.appendFile
// let users = [
//     {name: 'John', age: 30},
//     {name: 'Jane', age: 30},
//     {name: 'Bob', age: 30},
//     {name: 'Joe', age: 30}
// ]
// for (const user of users) {
//     await asyncAppendLineToFile('data.json', JSON.stringify(user));
// }
