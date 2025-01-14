const { Module, Workspace, Board, Group } = require('../models/schema'); 


async function query(filterBy) {
    try {
        const { moduleId, userId } = filterBy;
        const module = await Module.findById(moduleId).populate({
            path: 'workspaces',
            select: 'workspaceName createdBy members',
        });
        if (!module) {
            throw new Error('Module not found');
        }
        // console.log(module);
        
        const transformedWorkspaces = module.workspaces
        .filter(workspace => {
            return workspace.createdBy.toString() === userId || workspace.members.some(member => member.userId.toString() === userId);
          })
        .map(workspace => {
            const { _id, workspaceName } = workspace.toObject();
            return { workspaceId: _id.toString(), workspaceName };
        });
        // console.log(transformedWorkspaces);
        return transformedWorkspaces;
    } catch (err) {
        console.error('Error fetching workspaces:', err);
        throw err;
    }
}

async function getById(workspaceId) {
    try {
        const detailedWorkspace = await Workspace.findById(workspaceId)
            .populate({
                path: 'boards',
                select: 'boardName', 
            })
            .populate({
                path: 'members.userId', 
                select: 'email fullname _id', 
            });
        if (!detailedWorkspace) {
            throw new Error('Workspace not found');
        }
        const transformedBoards = detailedWorkspace.boards.map(board => {
            const { _id, boardName } = board.toObject();
            return { boardId: _id, boardName };
        });
        const transformedMembers = detailedWorkspace.members.map(member => {
            const { userId, role } = member.toObject();
            return {
                userId: userId._id || null,
                email: userId?.email || null,
                fullname: userId?.fullname || null,
                role, 
            };
        });
        return {workspaceId:workspaceId, workspaceName: detailedWorkspace.workspaceName, boards: transformedBoards, members: transformedMembers, }; 
    } catch (err) {
        console.error('Error fetching workspace by ID:', err);
        throw err;
    }
}

async function getWorkspaceDetailsById(workspaceId) {
    try {
        const detailedWorkspace = await Workspace.findById(workspaceId)
            .populate({
                path: 'boards', 
            });
        if (!detailedWorkspace) {
            throw new Error('Workspace not found');
        }
        return {
            workspaceId: detailedWorkspace._id,
            workspaceName: detailedWorkspace.workspaceName,
            createdBy: detailedWorkspace.createdBy,
            members: detailedWorkspace.members,  
            boards: detailedWorkspace.boards.map(board => board.toObject())
        };
    } catch (err) {
        console.error('Error fetching workspace by ID:', err);
        throw err;
    }
}


async function add(workspaceData) {
    try {
        workspaceData.members = [{ userId :workspaceData.createdBy , role:"admin"}];
        const workspace = new Workspace(workspaceData);
        await workspace.save();
        return workspace;
    } catch (err) {
        throw err;
    }
}

async function update(id, workspaceData) {
    try {
        const updatedWorkspace = await Workspace.findByIdAndUpdate(
            id,
            { $set: workspaceData },
            { new: true }
        );
        return updatedWorkspace;
    } catch (err) {
        throw err;
    }
}

async function remove(workspaceId, moduleId) {
    try {
        const moduleUpdate = await Module.findOneAndUpdate(
            { _id: moduleId }, 
            { $pull: { workspaces: workspaceId } }, 
            { new: true } 
        );
        if (!moduleUpdate) {
            throw new Error('Module not found');
        }
        const workspaceDelete = await Workspace.findByIdAndDelete(workspaceId);
        if (!workspaceDelete) {
            throw new Error('Workspace not found');
        }
        console.log(`Workspace with ID ${workspaceId} successfully removed from Module and deleted.`);
        return workspaceId;
    } catch (err) {
        console.error('Error removing workspace:', err);
        throw err;
    }
}

async function addMember(workspaceId, userId, adminId, role = 'member') {
    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            throw new Error('Workspace not found');
        }
        if (workspace.createdBy.toString() !== adminId) {
            return 'You do not have permission to add a user to this workspace';
        }
        const isAlreadyMember = workspace.members.some(
            member => member.userId.toString() === userId
        );
        if (isAlreadyMember) {
            return 'User is already a member of this workspace';
        }
        workspace.members.push({ userId, role });
        const updatedWorkspace = await workspace.save();
        return 'User added to Workspace successfully';
    } catch (err) {
        console.error('Error adding member to workspace:', err);
        throw err;
    }
}

async function removeMember(workspaceId, userId, adminId) {
    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            throw new Error('Workspace not found');
        }
        
        if (workspace.createdBy.toString() !== adminId) {
            return 'You do not have permission to remove a user from this workspace';
        }
        
        const isMember = workspace.members.some(
            member => member.userId.toString() === userId
        );
        
        if (!isMember) {
            return 'User is not a member of this workspace';
        }
        
        workspace.members = workspace.members.filter(
            member => member.userId.toString() !== userId
        );
        
        await workspace.save();
        
        return 'User removed from workspace successfully';
    } catch (err) {
        console.error('Error removing member from workspace:', err);
        throw err;
    }
}


// Board Functions
async function addBoard(workspaceId, boardData) {
    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            throw new Error('Workspace not found');
        }
        boardData.workspaceName = workspace.workspaceName;
        const board = new Board(boardData);
        await board.save();
        workspace.boards.push(board._id);
        const updatedWorkspace = await workspace.save();
        return {boardId:board.id, boardName: board.boardName};
    } catch (err) {
        console.error('Error adding board to workspace:', err);
        throw err;
    }
}

async function removeBoard(boardId) {
    try {
        const board = await Board.findById(boardId);
        if (!board) {
            throw new Error('Board not found');
        }
        const workspace = await Workspace.findOne({ boards: boardId });
        if (!workspace) {
            throw new Error('Workspace not found for the specified board');
        }
        const workspaceId = workspace._id;
        workspace.boards = workspace.boards.filter(
            (id) => id.toString() !== boardId
        );
        await workspace.save();
        await Board.findByIdAndDelete(boardId);
        return await boardId;
    } catch (err) {
        console.error('Error removing board:', err);
        throw err;
    }
}


async function updateBoard(boardId, boardData) {
    try {
        const board = await Board.findById(boardId);
        if (!board) {
            throw new Error('Board not found');
        }
        const updatedBoard = await Board.findByIdAndUpdate(
            boardId,
            { $set: boardData },
            { new: true }
        );
        return updatedBoard;
    } catch (err) {
        console.error('Error updating board:', err);
        throw { error: 'Failed to update board', details: err.message };
    }
}

async function updateGroup(groupId, groupData) {
    try {
        const group = await Group.findById(groupId);
        if (!group) {
            throw new Error('Group not found');
        }
        const updatedGroup = await Group.findByIdAndUpdate(
            groupId,
            { $set: groupData },
            { new: true } 
        );
        return updatedGroup;
    } catch (err) {
        console.error('Error updating group:', err);
        throw { error: 'Failed to update group', details: err.message };
    }
}




module.exports = {
    query,
    getById,
    getWorkspaceDetailsById,
    add,
    update,
    remove,
    addMember,
    removeMember,
    addBoard,
    removeBoard,
    updateBoard,
    updateGroup,
    
};
