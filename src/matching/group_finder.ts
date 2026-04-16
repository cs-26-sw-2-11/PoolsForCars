interface Cost {
    actual: number,
    heuristic: number
}

interface Group {
    rows: number,
    columns: number
    row_labels: [number, number][]
    column_labels: string[]
    values: Cost[][]
}


const groups: Group[] = [];
const newGroup: Group = {
    rows: 5,
    columns: 0,
    row_labels: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    column_labels: [],
    values: []
};

function add_group_vertex(group: Group, coordinates: [number, number], index: number) {
    group.row_labels[index] = coordinates;
}

function add_group_edge(group: Group, v1_index: number, v2_index: number) {
    group.column_labels.push(`e${group.columns}`);

    let newColumn: Cost[] = [];

    for (let i = 0; i < group.rows; i++) {
        let cost: Cost = {actual: 0, heuristic: 0};
        newColumn.push(cost);
    }

    let row1: [number, number] = [0, 0];
    let row2: [number, number] = [0, 0];

    if (group.row_labels[v1_index] !== undefined && group.row_labels[v2_index] !== undefined) {
        row1 = group?.row_labels[v1_index];
        row2 = group?.row_labels[v2_index];
    }

    let cost =
        Math.sqrt(
            Math.pow(row2[0] - row1[0], 2) +
            Math.pow(row2[1] - row1[1], 2)
    );

    if (newColumn[v1_index] !== undefined && newColumn[v2_index] !== undefined) {
        newColumn[v1_index].heuristic = cost;
        newColumn[v2_index].heuristic = cost;
    }

    group.values.push(newColumn);

    group.columns++;
}

function calc_viability_of_group_member(group: Group, user: [number, number]) {
    let userToVertexCosts: number[] = [];
    group.row_labels.forEach(vertex => {
        userToVertexCosts.push(
            Math.sqrt(
                Math.pow(user[0] - vertex[0], 2) +
                Math.pow(user[1] - vertex[1], 2)
            )
        )

    });

    let userToFinishCosts: number[] = [];
    let finishVertex: [number, number] = [0, 0];
    if (group.row_labels[4] !== undefined) {
        finishVertex = group.row_labels[4];
    }
    group.row_labels.forEach((vertex, index) => {
        if (vertex !== finishVertex) {
            userToFinishCosts.push(
                Math.sqrt(
                    Math.pow(vertex[0] - finishVertex[0], 2) +
                    Math.pow(vertex[1] - finishVertex[1], 2)
                )
            )
        }
    })

    userToFinishCosts.push(
        Math.sqrt(
            Math.pow(user[0] - finishVertex[0], 2) +
            Math.pow(user[1] - finishVertex[1], 2)
        )
    )
    

    let smallest: [number, number] = [0, userToVertexCosts[0] !== undefined ? userToVertexCosts[0] : 0];
    userToVertexCosts.forEach((element, index)=> {
        if (element < smallest[1]) {
            smallest[0] = index;
            smallest[1] = element;
        }
    });

    console.log(userToVertexCosts, smallest);
    console.log(userToFinishCosts);
}


// Add start node
add_group_vertex(newGroup, [0, 0], 0);
// Add destination node
add_group_vertex(newGroup, [100, 100], newGroup.rows - 1);

add_group_edge(newGroup, 0, newGroup.rows - 1);

// New member
let newUser1: [number, number] = [50, 8];
let newUser2: [number, number] = [60, 50];
add_group_vertex(newGroup, newUser1, 1);
add_group_vertex(newGroup, newUser2, 2);
add_group_edge(newGroup, 0, 1);
add_group_edge(newGroup, 1, 2);
add_group_edge(newGroup, 2, newGroup.rows - 1);


let newUser3: [number, number] = [35, 60];
calc_viability_of_group_member(newGroup, newUser3);


function print_group(group: Group) {
    let string = `Rows: ${group.rows}, Columns: ${group.columns}\n`

    for (let i = 0; i < group.columns; i++) {
        string += group.column_labels[i] + " | ";
    }
    string += "\n";

    for (let i = 0; i < group.rows; i++) {
        string += group.row_labels[i] + " | ";
        for (let j = 0; j < group.columns; j++) {
            string += group.values[j][i]?.heuristic + " ";
        };
        string += "\n";
    };
    console.log(string);
}

groups.push(newGroup);


print_group(newGroup);
