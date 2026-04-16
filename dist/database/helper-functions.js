import { promises as fsPromises } from 'fs';
import { join } from 'path';
export const DATABASE_DIRNAME = "src/database/";
export async function asyncWriteFile(filename, data) {
    try {
        await fsPromises.writeFile(join(DATABASE_DIRNAME, filename), data, {
            flag: 'w',
        });
    }
    catch (err) {
        console.log(err);
        return `Something went wrong while writing file ${join(DATABASE_DIRNAME, filename)}`;
    }
}
export async function asyncReadFile(filename) {
    try {
        const contents = await fsPromises.readFile(join(DATABASE_DIRNAME, filename), 'utf-8');
        return contents;
    }
    catch (err) {
        console.log(err);
        return `Something went wrong while reading file ${join(DATABASE_DIRNAME, filename)}`;
    }
}
export async function asyncAppendLineToFile(filename, data) {
    try {
        await fsPromises.appendFile(join(DATABASE_DIRNAME, filename), data + "\n");
    }
    catch (err) {
        console.log(err);
        return `Something went wrong while appending to file ${join(DATABASE_DIRNAME, filename)}`;
    }
}
//# sourceMappingURL=helper-functions.js.map