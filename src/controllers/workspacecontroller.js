const jwt = require('jsonwebtoken');
const workspaceService = require('../services/workspace');
const workService = require('../services/workservice');
const devService = require('../services/devservice');
const service = require('../services/service');
const crmService = require('../services/crmservice');

const { Module } = require('../models/schema');

async function getWorkspaces(token, moduleId) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        // console.log(userId);
        const filterBy = { moduleId, userId };
        const workspaces = await workspaceService.query(filterBy);
        // console.log("Workspaces",workspaces);
        return workspaces;
    } catch (err) {
        console.log('Failed to get workspaces: ' + err.message);
    }
}

async function getWorkspaceById(id) {
    try {
        const workspace = await workspaceService.getById(id);
        // console.log(workspace);
        
        if (!workspace) console.log('Workspace not found');
        return workspace;
    } catch (err) {
        console.log('Failed to get workspace: ' + err.message);
    }
}

async function getWorkspaceDetailsById(id) {
    try {
        const workspace = await workspaceService.getWorkspaceDetailsById(id);
        // console.log(workspace);
        
        if (!workspace) console.log('Workspace not found');
        return workspace;
    } catch (err) {
        console.log('Failed to get workspace: ' + err.message);
    }
}

async function createWorkspace(data) {
    try {
        const newWorkspace = await workspaceService.add(data);
        await Module.findByIdAndUpdate(data.moduleId, { $push: { workspaces: newWorkspace._id } });
        return newWorkspace;
    } catch (err) {
        console.log('Failed to create workspace: ' + err.message);
    }
}

async function updateWorkspace(id, updateData) {
    try {
        const updatedWorkspace = await workspaceService.update(id, updateData);
        return updatedWorkspace;
    } catch (err) {
        console.log('Failed to update workspace: ' + err.message);
    }
}

async function deleteWorkspace(id, moduleId) {
    try {
        const workspaceId = await workspaceService.remove(id, moduleId);
        return workspaceId;
    } catch (err) {
        console.log('Failed to delete workspace: ' + err.message);
    }
}

async function addMemberToWorkspace(id, userId, token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminId = decoded._id;
        const response = await workspaceService.addMember(id, userId, adminId);
        return response;
    } catch (err) {
        console.log('Failed to add member to workspace: ' + err.message);
    }
}

async function removeMemberToWorkspace(id, userId, token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminId = decoded._id;
        const response = await workspaceService.removeMember(id, userId, adminId);
        return response;
    } catch (err) {
        console.log('Failed to add member to workspace: ' + err.message);
    }
}

async function addBoardToWorkspace(id, boardData) {
    try {
        const updatedWorkspace = await workspaceService.addBoard(id, boardData);
        return updatedWorkspace;
    } catch (err) {
        console.log('Failed to add board to workspace'+ err.message );
    }
}

async function removeBoardFromWorkspace(boardId) {
    try {
        const updatedWorkspace = await workspaceService.removeBoard(boardId);
        return updatedWorkspace;
    } catch (err) {
        console.log('Failed to remove board from workspace'+err.message );
    }
}

async function updateBoardInWorkspace(boardId, boardData) {
    try {
        const updatedWorkspace = await workspaceService.updateBoard(boardId, boardData);
        return updatedWorkspace;
    } catch (err) {
        console.log('Failed to update board in workspace'+ err.message );
    }
}

async function getBoardById(boardId, type) {
    try {
        let boardData;
        if(type=="Bug"){
            boardData = await devService.getBugBoard(boardId);
        }else if(type=="Task"){
            boardData = await devService.getTaskBoard(boardId);
        }else if(type=="Sprint"){
            boardData = await devService.getSprintBoard(boardId);
        }else if(type=="Contact"){
            boardData = await crmService.getContactBoard(boardId);
        }else if(type=="Lead"){
            boardData = await crmService.getLeadBoard(boardId);
        }else if(type=="Incident"){
            boardData = await service.getIncidentBoard(boardId);
        }else if(type=="Ticket"){
            boardData = await service.getTicketBoard(boardId);
        }else{
            boardData = await workService.getBoard(boardId);
        }
        
        return boardData;
    } catch (err) {
        console.error('Error in getBoardById:', err);
    }
}


// Group Functions

async function addGroupToBoard(boardId, groupData, type) {
    try {
        let boardData;
        if(type=="Bug"){
            boardData = await devService.addBugGroup(boardId, groupData);
        }else if(type=="Task"){
            boardData = await devService.addTaskGroup(boardId, groupData);
        }else if(type=="Sprint"){
            boardData = await devService.addSprintGroup(boardId, groupData);
        }else if(type=="Contact"){
            boardData = await crmService.addContactGroup(boardId, groupData);
        }else if(type=="Lead"){
            boardData = await crmService.addLeadGroup(boardId, groupData);
        }else if(type=="Incident"){
            boardData = await service.addIncidentGroup(boardId, groupData);
        }else if(type=="Ticket"){
            boardData = await service.addTicketGroup(boardId, groupData);
        }else{
            boardData = await workService.addGroup(boardId, groupData);
        }
        
        return boardData;
    } catch (err) {
        console.log('Failed to add group to board'+ err.message );
    }
}

async function removeGroupFromBoard(groupId, type) {
    try {
        let boardData;
        if(type=="Bug"){
            boardData = await devService.removeBugGroup(groupId);
        }else if(type=="Task"){
            boardData = await devService.removeTaskGroup(groupId);
        }else if(type=="Sprint"){
            boardData = await devService.removeSprintGroup(groupId);
        }else if(type=="Contact"){
            boardData = await crmService.removeContactGroup(groupId);
        }else if(type=="Lead"){
            boardData = await crmService.removeLeadGroup(groupId);
        }else if(type=="Incident"){
            boardData = await service.removeIncidentGroup(groupId);
        }else if(type=="Ticket"){
            boardData = await service.removeTicketGroup(groupId);
        }else{
            boardData = await workService.removeGroup(groupId);
        }
        
        return boardData;
    } catch (err) {
        console.log('Failed to remove group from board'+ err.message );
    }
}

async function updateGroupInBoard(groupId, groupData) {
    try {
        let updatedGroup = await workspaceService.updateGroup(groupId,groupData);        
        return updatedGroup;
    } catch (err) {
        console.log('Failed to update group in board'+err.message );
    }
}

async function addItemToGroup(groupId, itemData, type) {
    try {
        let updatedGroup;
        if(type=="Bug"){
            updatedGroup = await devService.addBugToGroup(groupId,itemData);
        }else if(type=="Task"){
            updatedGroup = await devService.addTaskToGroup(groupId,itemData);
        }else if(type=="Sprint"){
            updatedGroup = await devService.addSprintToGroup(groupId,itemData);
        }else if(type=="Contact"){
            updatedGroup = await crmService.addContactToGroup(groupId,itemData);
        }else if(type=="Lead"){
            updatedGroup = await crmService.addLeadToGroup(groupId,itemData);
        }else if(type=="Incident"){
            updatedGroup = await service.addIncidentToGroup(groupId,itemData);
        }else if(type=="Ticket"){
            updatedGroup = await service.addTicketToGroup(groupId,itemData);
        }else{
            updatedGroup = await workService.addItemToGroup(groupId,itemData);
        }
        return updatedGroup;
    } catch (err) {
        console.log('Failed to add item to group'+ err.message );
    }
}

async function addItem(itemData, type) {
    try {
        let item;
        if(type=="Bug"){
            item = await devService.addBug(itemData);
        }else if(type=="Task"){
            item = await devService.addTask(itemData);
        }else if(type=="Sprint"){
            item = await devService.addSprint(itemData);
        }else if(type=="Contact"){
            item = await crmService.addContact(itemData);
        }else if(type=="Lead"){
            item = await crmService.addLead(itemData);
        }else if(type=="Incident"){
            item = await service.addIncident(itemData);
        }else if(type=="Ticket"){
            item = await service.addTicket(itemData);
        }else{
            item = await workService.addItem(itemData);
        }
        return item;
    } catch (err) {
        console.log('Failed to create item '+ err.message );
    }
}

async function removeItemFromGroup(itemId, type) {
    try {
        let updatedGroup;
        if(type=="Bug"){
            updatedGroup = await devService.removeBugFromGroup(itemId);
        }else if(type=="Task"){
            updatedGroup = await devService.removeTaskFromGroup(itemId);
        }else if(type=="Sprint"){
            updatedGroup = await devService.removeSprintFromGroup(itemId);
        }else if(type=="Contact"){
            updatedGroup = await crmService.removeContactFromGroup(itemId);
        }else if(type=="Lead"){
            updatedGroup = await crmService.removeLeadFromGroup(itemId);
        }else if(type=="Incident"){
            updatedGroup = await service.removeIncidentFromGroup(itemId);
        }else if(type=="Ticket"){
            updatedGroup = await service.removeTicketFromGroup(itemId);
        }else{
            updatedGroup = await workService.removeItemFromGroup(itemId);
        }
        return updatedGroup;
    } catch (err) {
        console.log('Failed to remove item from group' + err.message );
    }
}

async function updateItemInGroup(itemId, itemData, type) {
    try {
        itemData._id=itemId;
        let item;
        if(type=="Bug"){
            item = await devService.updateBugInGroup(itemData);
        }else if(type=="Task"){
            item = await devService.updateTaskInGroup(itemData);
        }else if(type=="Sprint"){
            item = await devService.updateSprintInGroup(itemData);
        }else if(type=="Contact"){
            item = await crmService.updateContactInGroup(itemData);
        }else if(type=="Lead"){
            item = await crmService.updateLeadInGroup(itemData);
        }else if(type=="Incident"){
            item = await service.updateIncidentInGroup(itemData);
        }else if(type=="Ticket"){
            item = await service.updateTicketInGroup(itemData);
        }else{
            item = await workService.updateItemInGroup(itemData);
        }
        return item;
    } catch (err) {
        console.log('Failed to update item in group'+err.message );
    }
}

async function addMembersToItem(itemId, userId, type) {
    try {
        let item;
        if(type=="Bug"){
            item = await devService.addMembersToBug(itemId, userId);
        }else if(type=="Task"){
            item = await devService.addMembersToTask(itemId, userId);
        }else if(type=="Sprint"){
            item = await devService.addMembersToSprint(itemId, userId);
        }else if(type=="Contact"){
            item = await crmService.addMembersToContact(itemId, userId);
        }else if(type=="Lead"){
            item = await crmService.addMembersToLead(itemId, userId);
        }else if(type=="Incident"){
            item = await service.addMembersToIncident(itemId, userId);
        }else if(type=="Ticket"){
            item = await service.addMembersToTicket(itemId, userId);
        }else{
            item = await workService.addMembersToItem(itemId, userId);
        }
        return item;
    } catch (err) {
        console.log('Failed to add members to item'+err.message);
    }
}

async function removeMembersFromItem(itemId, userId, type) {
    try {
        let item;
        if(type=="Bug"){
            item = await devService.removeMembersFromBug(itemId, userId);
        }else if(type=="Task"){
            item = await devService.removeMembersFromTask(itemId, userId);
        }else if(type=="Sprint"){
            item = await devService.removeMembersFromSprint(itemId, userId);
        }else if(type=="Contact"){
            item = await crmService.removeMembersFromContact(itemId, userId);
        }else if(type=="Lead"){
            item = await crmService.removeMembersFromLead(itemId, userId);
        }else if(type=="Incident"){
            item = await service.removeMembersFromIncident(itemId, userId);
        }else if(type=="Ticket"){
            item = await service.removeMembersFromTicket(itemId, userId);
        }else{
            item = await workService.removeMembersFromItem(itemId, userId);
        }
        return item;
    } catch (err) {
        console.log('Failed to remove members from item: ' + err.message);
        throw err;
    }
}

module.exports = {
    getWorkspaces,
    getWorkspaceById,
    getWorkspaceDetailsById,
    createWorkspace,
    updateWorkspace,
    addMemberToWorkspace,
    removeMemberToWorkspace,
    deleteWorkspace,
    addBoardToWorkspace,
    removeBoardFromWorkspace,
    updateBoardInWorkspace,
    getBoardById,
    addGroupToBoard,
    removeGroupFromBoard,
    updateGroupInBoard,
    addItemToGroup,
    addItem,
    removeItemFromGroup,
    updateItemInGroup,
    addMembersToItem,
    removeMembersFromItem,
};