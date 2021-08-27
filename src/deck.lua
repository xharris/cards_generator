local DECK_ARCH = "casual"

local orig_objects = {}
local card_info = {}
local cards_json_url = "http://cloud-3.steamusercontent.com/ugc/1771572500940558337/C3645056E23249A4D72706E8AFF6C40F438C3873/"
local ready = false

function onLoad()
    orig_objects = self.getObjects()
    WebRequest.get(cards_json_url, function(data)
        card_info = JSON.decode(data.text)[DECK_ARCH]
        -- set card names/descriptions
        for i, info in ipairs(card_info) do 
            local orig = orig_objects[i]
            if orig then 
                orig.name = info.name
                local obj = getObjectFromGUID(orig.guid)
                print(orig.name, obj)
            end 
        end
    end)
end

function onUpdate()
    if not ready then return 1 end

    local curr_objects = self.getObjects()
    for o, orig in ipairs(orig_objects) do 
        local found = false
        for c, curr in ipairs(curr_objects) do 
            if (curr.index == orig.index) then 
                found = true
            end 
        end
        if not found then 
            print(orig)
            -- self.putObject(orig)
        end
    end 
end 