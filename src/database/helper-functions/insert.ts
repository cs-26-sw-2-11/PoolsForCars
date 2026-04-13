import { promises as fsPromises } from 'fs';
import {join} from 'path';

async function asyncWriteFile(filename: string, data: any){
    try {
        await fsPromises.writeFile(join("src/database/", filename), data, {
            flag: 'w',
        });

        const contents = await fsPromises.readFile(
            join("src/database/", filename),
            'utf-8',
        );
        console.log(contents); 

        return contents;
    } catch (err) {
        console.log(err);
        return 'Something went wrong';
    }
}


asyncWriteFile('data.json', JSON.stringify({ name: 'John', age: 30 }, null, 2));
