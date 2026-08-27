// ═══════════════════════════════════════
// CODE TEMPLATES - Roblox AI Coder
// ═══════════════════════════════════════

const CODE_BANK = `-- ═══════════════════════════════════════
-- نظام بنك كامل لـ Roblox
-- ═══════════════════════════════════════

local Players = game:GetService('Players')
local ReplicatedStorage = game:GetService('ReplicatedStorage')
local DataStoreService = game:GetService('DataStoreService')

local BankEvents = Instance.new('Folder')
BankEvents.Name = 'BankEvents'
BankEvents.Parent = ReplicatedStorage

local DepositEvent = Instance.new('RemoteEvent')
DepositEvent.Name = 'Deposit'
DepositEvent.Parent = BankEvents

local WithdrawEvent = Instance.new('RemoteEvent')
WithdrawEvent.Name = 'Withdraw'
WithdrawEvent.Parent = BankEvents

local CheckBalanceEvent = Instance.new('RemoteEvent')
CheckBalanceEvent.Name = 'CheckBalance'
CheckBalanceEvent.Parent = BankEvents

local InterestEvent = Instance.new('RemoteEvent')
InterestEvent.Name = 'PayInterest'
InterestEvent.Parent = BankEvents

local DataStore = DataStoreService:GetDataStore('BankData_v1')

local BankManager = {}
BankManager.Accounts = {}
BankManager.INTEREST_RATE = 0.02
BankManager.INTEREST_INTERVAL = 60
BankManager.MIN_DEPOSIT = 10
BankManager.MAX_DEPOSIT = 1000000

function BankManager:GetKey(player)
    return 'bank_' .. player.UserId
end

function BankManager:LoadAccount(player)
    local key = self:GetKey(player)
    local success, data = pcall(function()
        return DataStore:GetAsync(key)
    end)
    if success and data then
        self.Accounts[player.UserId] = {
            balance = data.balance or 0,
            totalDeposited = data.totalDeposited or 0,
            lastInterest = data.lastInterest or os.time()
        }
    else
        self.Accounts[player.UserId] = {
            balance = 0, totalDeposited = 0, lastInterest = os.time()
        }
    end
    print('[Bank] Loaded account for ' .. player.Name .. ' | Balance: $' .. self.Accounts[player.UserId].balance)
end

function BankManager:SaveAccount(player)
    local account = self.Accounts[player.UserId]
    if not account then return end
    local key = self:GetKey(player)
    pcall(function()
        DataStore:SetAsync(key, {
            balance = account.balance,
            totalDeposited = account.totalDeposited,
            lastInterest = account.lastInterest
        })
    end)
end

function BankManager:Deposit(player, amount)
    if amount < self.MIN_DEPOSIT then
        return false, 'الحد الأدنى $' .. self.MIN_DEPOSIT
    end
    local account = self.Accounts[player.UserId]
    if not account then return false, 'الحساب غير موجود' end
    local ls = player:FindFirstChild('leaderstats')
    local cash = ls and ls:FindFirstChild('Cash')
    if not cash or cash.Value < amount then
        return false, 'ليس لديك floos كافية!'
    end
    cash.Value -= amount
    account.balance += amount
    account.totalDeposited += amount
    self:SaveAccount(player)
    return true, 'تم الإيداع! الرصيد: $' .. account.balance
end

function BankManager:Withdraw(player, amount)
    local account = self.Accounts[player.UserId]
    if not account then return false, 'الحساب غير موجود' end
    if amount <= 0 then return false, 'المبلغ غير صحيح' end
    if amount > account.balance then return false, 'الرصيد غير كافي!' end
    account.balance -= amount
    local ls = player:FindFirstChild('leaderstats')
    local cash = ls and ls:FindFirstChild('Cash')
    if cash then cash.Value += amount end
    self:SaveAccount(player)
    return true, 'تم السحب! الرصيد: $' .. account.balance
end

function BankManager:GetBalance(player)
    local account = self.Accounts[player.UserId]
    return account and account.balance or 0
end

function BankManager:PayInterest(player)
    local account = self.Accounts[player.UserId]
    if not account then return end
    if os.time() - account.lastInterest < self.INTEREST_INTERVAL then return end
    if account.balance > 0 then
        local interest = math.floor(account.balance * self.INTEREST_RATE)
        if interest > 0 then
            account.balance += interest
            account.lastInterest = os.time()
            self:SaveAccount(player)
            InterestEvent:FireClient(player, interest, account.balance)
        end
    end
end

DepositEvent.OnServerEvent:Connect(function(player, amount)
    amount = tonumber(amount)
    if not amount then return end
    local ok, msg = BankManager:Deposit(player, amount)
    DepositEvent:FireClient(player, ok, msg)
end)

WithdrawEvent.OnServerEvent:Connect(function(player, amount)
    amount = tonumber(amount)
    if not amount then return end
    local ok, msg = BankManager:Withdraw(player, amount)
    WithdrawEvent:FireClient(player, ok, msg)
end)

CheckBalanceEvent.OnServerEvent:Connect(function(player)
    CheckBalanceEvent:FireClient(player, BankManager:GetBalance(player))
end)

task.spawn(function()
    while true do
        for _, p in ipairs(Players:GetPlayers()) do
            BankManager:PayInterest(p)
        end
        task.wait(BankManager.INTEREST_INTERVAL)
    end
end)

Players.PlayerAdded:Connect(function(p) BankManager:LoadAccount(p) end)
Players.PlayerRemoving:Connect(function(p) BankManager:SaveAccount(p); BankManager.Accounts[p.UserId] = nil end)
game:BindToClose(function() for _, p in ipairs(Players:GetPlayers()) do BankManager:SaveAccount(p) end end)

print('[Bank] System loaded!')`;

const CODE_SHOP = `-- ═══════════════════════════════════════
-- نظام متجر كامل لـ Roblox
-- ═══════════════════════════════════════

local Players = game:GetService('Players')
local ReplicatedStorage = game:GetService('ReplicatedStorage')

local ShopEvents = Instance.new('Folder')
ShopEvents.Name = 'ShopEvents'
ShopEvents.Parent = ReplicatedStorage

local BuyEvent = Instance.new('RemoteEvent')
BuyEvent.Name = 'BuyItem'
BuyEvent.Parent = ShopEvents

local GetShopEvent = Instance.new('RemoteEvent')
GetShopEvent.Name = 'GetShopData'
GetShopEvent.Parent = ShopEvents

local ShopItems = {
    {id='sword', name='سيف حديدي', price=100, category='weapons', rarity='common'},
    {id='shield', name='درع خشبي', price=200, category='armor', rarity='common'},
    {id='speed', name='تعزيز السرعة', price=50, category='consumable', rarity='common'},
    {id='double_jump', name='قفزة مزدوجة', price=500, category='ability', rarity='rare'},
    {id='flight', name='جناح الطيران', price=1000, category='ability', rarity='epic'},
    {id='vip', name='VIP Pass', price=5000, category='special', rarity='legendary'}
}

local ShopManager = {}
ShopManager.Purchases = {}

function ShopManager:BuyItem(player, itemId)
    local item = nil
    for _, si in ipairs(ShopItems) do
        if si.id == itemId then item = si; break end
    end
    if not item then return false, 'المنتج غير موجود!' end

    local ls = player:FindFirstChild('leaderstats')
    local cash = ls and ls:FindFirstChild('Cash')
    if not cash then return false, 'خطأ!' end
    if cash.Value < item.price then return false, 'floos غير كافية!' end

    local pd = self.Purchases[player.UserId]
    if pd then
        for _, pid in ipairs(pd) do
            if pid == itemId then return false, 'اشتركته بالفعل!' end
        end
    end

    cash.Value -= item.price
    table.insert(self.Purchases[player.UserId], itemId)
    self:ApplyItem(player, item)
    return true, 'تم شراء ' .. item.name .. '!'
end

function ShopManager:ApplyItem(player, item)
    local char = player.Character
    if not char then return end
    if item.id == 'speed' then
        local h = char:FindFirstChild('Humanoid')
        if h then
            local orig = h.WalkSpeed
            h.WalkSpeed = orig * 1.5
            task.delay(30, function()
                if h and h.Parent then h.WalkSpeed = orig end
            end)
        end
    elseif item.id == 'sword' then
        local tool = Instance.new('Tool')
        tool.Name = item.name
        tool.RequiresHandle = true
        local handle = Instance.new('Part')
        handle.Name = 'Handle'
        handle.Size = Vector3.new(1, 5, 1)
        handle.BrickColor = BrickColor.new('Medium stone grey')
        handle.Parent = tool
        tool.Parent = player.Backpack
    end
end

Players.PlayerAdded:Connect(function(p)
    ShopManager.Purchases[p.UserId] = {}
end)

BuyEvent.OnServerEvent:Connect(function(player, itemId)
    local ok, msg = ShopManager:BuyItem(player, itemId)
    BuyEvent:FireClient(player, ok, msg)
end)

GetShopEvent.OnServerEvent:Connect(function(player)
    GetShopEvent:FireClient(player, ShopItems)
end)

print('[Shop] System loaded! ' .. #ShopItems .. ' items')`;

const CODE_LEVEL = `-- ═══════════════════════════════════════
-- نظام ليفل و XP كامل
-- ═══════════════════════════════════════

local Players = game:GetService('Players')
local ReplicatedStorage = game:GetService('ReplicatedStorage')

local LevelEvents = Instance.new('Folder')
LevelEvents.Name = 'LevelEvents'
LevelEvents.Parent = ReplicatedStorage

local XPGainedEvent = Instance.new('RemoteEvent')
XPGainedEvent.Name = 'XPGained'
XPGainedEvent.Parent = LevelEvents

local LevelUpEvent = Instance.new('RemoteEvent')
LevelUpEvent.Name = 'LevelUp'
LevelUpEvent.Parent = LevelEvents

local LevelSystem = {}
LevelSystem.Players = {}
LevelSystem.BaseXP = 100
LevelSystem.XPMultiplier = 1.5
LevelSystem.MaxLevel = 100

LevelSystem.Rewards = {
    [5]={type='cash', amount=500, msg='مكافأة Lv5: $500'},
    [10]={type='title', title='محارب', msg='لقب: محارب'},
    [20]={type='ability', ability='dash', msg='قدرة: اندفاع'},
    [50]={type='ability', ability='heal', msg='قدرة: شفاء'},
    [100]={type='title', title='أسطوري', msg='لقب أسطوري!'}
}

function LevelSystem:ReqXP(level)
    return math.floor(self.BaseXP * (level ^ self.XPMultiplier))
end

function LevelSystem:Init(player)
    self.Players[player.UserId] = {level=1, xp=0, totalXP=0, title=''}
    self:UpdateLS(player)
end

function LevelSystem:AddXP(player, amount)
    local d = self.Players[player.UserId]
    if not d then return end
    if d.level >= self.MaxLevel then return end
    d.xp += amount
    d.totalXP += amount
    XPGainedEvent:FireClient(player, amount, d.xp, self:ReqXP(d.level))
    while d.xp >= self:ReqXP(d.level) and d.level < self.MaxLevel do
        d.xp -= self:ReqXP(d.level)
        d.level += 1
        self:ApplyReward(player, d.level)
        self:UpdateLS(player)
        LevelUpEvent:FireClient(player, d.level)
        print('[Level] ' .. player.Name .. ' -> Lv' .. d.level)
    end
    self:UpdateLS(player)
end

function LevelSystem:UpdateLS(player)
    local ls = player:FindFirstChild('leaderstats')
    if ls and ls:FindFirstChild('Level') then
        ls.Level.Value = self.Players[player.UserId].level
    end
end

function LevelSystem:ApplyReward(player, level)
    local r = self.Rewards[level]
    if not r then return end
    if r.type == 'cash' then
        local ls = player:FindFirstChild('leaderstats')
        local c = ls and ls:FindFirstChild('Cash')
        if c then c.Value += r.amount end
    elseif r.type == 'title' then
        self.Players[player.UserId].title = r.title
    end
    LevelUpEvent:FireClient(player, level, r)
end

Players.PlayerAdded:Connect(function(p)
    LevelSystem:Init(p)
    p.CharacterAdded:Connect(function(c)
        local h = c:WaitForChild('Humanoid')
        h.Died:Connect(function()
            task.delay(3, function() LevelSystem:AddXP(p, 10) end)
        end)
    end)
end)

Players.PlayerRemoving:Connect(function(p)
    LevelSystem.Players[p.UserId] = nil
end)

print('[Level] System loaded!')`;

const CODE_COMBAT = `-- ═══════════════════════════════════════
-- نظام قتال كامل
-- ═══════════════════════════════════════

local Players = game:GetService('Players')
local ReplicatedStorage = game:GetService('ReplicatedStorage')
local Debris = game:GetService('Debris')
local TS = game:GetService('TweenService')

local CombatEvents = Instance.new('Folder')
CombatEvents.Name = 'CombatEvents'
CombatEvents.Parent = ReplicatedStorage

local AttackEvent = Instance.new('RemoteEvent')
AttackEvent.Name = 'Attack'
AttackEvent.Parent = CombatEvents

local DashEvent = Instance.new('RemoteEvent')
DashEvent.Name = 'Dash'
DashEvent.Parent = CombatEvents

local Combat = {}
Combat.Players = {}
Combat.Settings = {
    Damage = 25, Range = 8, Cooldown = 0.5,
    DashDist = 20, DashCD = 3,
    BlockReduction = 0.7, ComboWindow = 1.5
}

function Combat:Init(player)
    self.Players[player.UserId] = {
        lastAttack = 0, lastDash = 0, isBlocking = false,
        combo = 0, lastHit = 0, kills = 0
    }
end

function Combat:Attack(player)
    local d = self.Players[player.UserId]
    if not d then return end
    local now = tick()
    if now - d.lastAttack < Combat.Settings.Cooldown then return end
    d.lastAttack = now
    if now - d.lastHit < Combat.Settings.ComboWindow then d.combo += 1 else d.combo = 1 end
    d.lastHit = now

    local char = player.Character
    if not char then return end
    local hrp = char:FindFirstChild('HumanoidRootPart')
    if not hrp then return end

    local dmg = Combat.Settings.Damage
    if d.combo > 1 then dmg = math.floor(dmg * (1 + (d.combo - 1) * 0.5)) end

    local origin = hrp.Position + Vector3.new(0, 2, 0)
    local dir = hrp.CFrame.LookVector * Combat.Settings.Range
    local params = RaycastParams.new()
    params.FilterDescendantsInstances = {char}
    params.FilterType = Enum.RaycastFilterType.Exclude
    local result = workspace:Raycast(origin, dir, params)

    if result and result.Instance then
        local hitChar = result.Instance:FindFirstAncestorOfClass('Model')
        if hitChar then
            local hitH = hitChar:FindFirstChild('Humanoid')
            local hitP = Players:GetPlayerFromCharacter(hitChar)
            if hitH and hitP and hitP ~= player then
                hitH:TakeDamage(dmg)
                self:HitEffect(result.Position)
                AttackEvent:FireClient(player, {hit=true, damage=dmg, combo=d.combo, target=hitP.Name})
                return
            end
        end
    end
    AttackEvent:FireClient(player, {hit=false, damage=0, combo=d.combo})
end

function Combat:Dash(player)
    local d = self.Players[player.UserId]
    if not d then return end
    local now = tick()
    if now - d.lastDash < Combat.Settings.DashCD then return end
    d.lastDash = now

    local char = player.Character
    if not char then return end
    local hrp = char:FindFirstChild('HumanoidRootPart')
    if not hrp then return end

    local goal = hrp.Position + hrp.CFrame.LookVector * Combat.Settings.DashDist
    local tween = TS:Create(hrp, TweenInfo.new(0.2, Enum.EasingStyle.Quad), {Position = goal})
    tween:Play()
    DashEvent:FireClient(player, {success=true})
end

function Combat:HitEffect(pos)
    local p = Instance.new('Part')
    p.Size = Vector3.new(1,1,1); p.Position = pos; p.Anchored = true; p.CanCollide = false
    p.Material = Enum.Material.Neon; p.BrickColor = BrickColor.new('Bright red'); p.Parent = workspace
    Debris:AddItem(p, 0.3)
    TS:Create(p, TweenInfo.new(0.3), {Size=Vector3.new(3,3,3), Transparency=1}):Play()
end

Players.PlayerAdded:Connect(function(p) Combat:Init(p) end)
Players.PlayerRemoving:Connect(function(p) Combat.Players[p.UserId] = nil end)
AttackEvent.OnServerEvent:Connect(function(p) Combat:Attack(p) end)
DashEvent.OnServerEvent:Connect(function(p) Combat:Dash(p) end)

print('[Combat] System loaded!')`;

const CODE_GUI = `-- ═══════════════════════════════════════
-- واجهة GUI كاملة
-- LocalScript في StarterGui
-- ═══════════════════════════════════════

local Players = game:GetService('Players')
local TS = game:GetService('TweenService')
local player = Players.LocalPlayer
local playerGui = player:WaitForChild('PlayerGui')

local gui = Instance.new('ScreenGui')
gui.Name = 'GameGUI'
gui.ResetOnSpawn = false
gui.Parent = playerGui

local function corner(p, r)
    local c = Instance.new('UICorner')
    c.CornerRadius = UDim.new(0, r or 8)
    c.Parent = p
end

local function stroke(p, col, th)
    local s = Instance.new('UIStroke')
    s.Color = col or Color3.fromRGB(0, 180, 216)
    s.Thickness = th or 2
    s.Parent = p
end

-- اللوحة الرئيسية
local main = Instance.new('Frame')
main.Name = 'MainFrame'
main.Size = UDim2.new(0.35, 0, 0.5, 0)
main.Position = UDim2.new(0.5, 0, 0.5, 0)
main.AnchorPoint = Vector2.new(0.5, 0.5)
main.BackgroundColor3 = Color3.fromRGB(20, 25, 35)
main.BorderSizePixel = 0
main.Parent = gui
corner(main, 12)
stroke(main)

-- العنوان
local title = Instance.new('TextLabel')
title.Size = UDim2.new(1, 0, 0, 50)
title.BackgroundColor3 = Color3.fromRGB(15, 20, 30)
title.BorderSizePixel = 0
title.Text = '🎮 لوحة التحكم'
title.TextColor3 = Color3.fromRGB(0, 180, 216)
title.TextSize = 22
title.Font = Enum.Font.GothamBold
title.Parent = main
corner(title, 12)

local list = Instance.new('UIListLayout')
list.Padding = UDim.new(0, 8)
list.HorizontalAlignment = Enum.HorizontalAlignment.Center
list.SortOrder = Enum.SortOrder.LayoutOrder
list.Parent = main

local pad = Instance.new('UIPadding')
pad.PaddingTop = UDim.new(0, 55)
pad.PaddingRight = UDim.new(0, 15)
pad.PaddingBottom = UDim.new(0, 15)
pad.PaddingLeft = UDim.new(0, 15)
pad.Parent = main

local function btn(name, text, color, order)
    local b = Instance.new('TextButton')
    b.Name = name; b.Size = UDim2.new(1, 0, 0, 45)
    b.BackgroundColor3 = color or Color3.fromRGB(30, 40, 55)
    b.BorderSizePixel = 0; b.Text = text
    b.TextColor3 = Color3.new(1,1,1); b.TextSize = 16
    b.Font = Enum.Font.GothamMedium; b.LayoutOrder = order or 0
    b.Parent = main; corner(b, 8)
    b.MouseEnter:Connect(function()
        TS:Create(b, TweenInfo.new(0.2), {BackgroundColor3=Color3.fromRGB(0,180,216)}):Play()
    end)
    b.MouseLeave:Connect(function()
        TS:Create(b, TweenInfo.new(0.2), {BackgroundColor3=color or Color3.fromRGB(30,40,55)}):Play()
    end)
    return b
end

btn('ShopBtn', '🛒 المتجر', nil, 1)
btn('InventoryBtn', '🎒 الحقيبة', nil, 2)
btn('SettingsBtn', '⚙️ الإعدادات', nil, 3)
btn('CloseBtn', '❌ إغلاق', Color3.fromRGB(100, 40, 40), 4)

-- شريط الصحة
local stats = Instance.new('Frame')
stats.Size = UDim2.new(0.2, 0, 0, 60)
stats.Position = UDim2.new(0.5, 0, 0.02, 0)
stats.AnchorPoint = Vector2.new(0.5, 0)
stats.BackgroundColor3 = Color3.fromRGB(20, 25, 35)
stats.BorderSizePixel = 0; stats.Parent = gui
corner(stats, 10); stroke(stats, Color3.fromRGB(0, 180, 216), 1)

local hLabel = Instance.new('TextLabel')
hLabel.Size = UDim2.new(0.9, 0, 0, 18)
hLabel.Position = UDim2.new(0.05, 0, 0.08, 0)
hLabel.BackgroundTransparency = 1
hLabel.Text = '❤️ الصحة'
hLabel.TextColor3 = Color3.fromRGB(255, 80, 80)
hLabel.TextSize = 12; hLabel.Font = Enum.Font.GothamBold
hLabel.TextXAlignment = Enum.TextXAlignment.Left
hLabel.Parent = stats

local hBg = Instance.new('Frame')
hBg.Size = UDim2.new(0.9, 0, 0, 10)
hBg.Position = UDim2.new(0.05, 0, 0.5, 0)
hBg.BackgroundColor3 = Color3.fromRGB(40, 40, 40)
hBg.BorderSizePixel = 0; hBg.Parent = stats; corner(hBg, 5)

local hBar = Instance.new('Frame')
hBar.Name = 'HealthBar'
hBar.Size = UDim2.new(1, 0, 1, 0)
hBar.BackgroundColor3 = Color3.fromRGB(255, 80, 80)
hBar.BorderSizePixel = 0; hBar.Parent = hBg; corner(hBar, 5)

local function updateHP()
    local c = player.Character
    if not c then return end
    local h = c:FindFirstChild('Humanoid')
    if not h then return end
    TS:Create(hBar, TweenInfo.new(0.3), {Size=UDim2.new(h.Health/h.MaxHealth, 0, 1, 0)}):Play()
end

player.CharacterAdded:Connect(function(c)
    local h = c:WaitForChild('Humanoid')
    h.HealthChanged:Connect(updateHP)
    updateHP()
end)

print('[GUI] Loaded!')`;

const CODE_REMOTE = `-- ═══════════════════════════════════════
-- RemoteEvents كامل
-- Server Script في ServerScriptService
-- ═══════════════════════════════════════

local Players = game:GetService('Players')
local RS = game:GetService('ReplicatedStorage')

local Folder = Instance.new('Folder')
Folder.Name = 'GameRemotes'
Folder.Parent = RS

local MessageEvent = Instance.new('RemoteEvent')
MessageEvent.Name = 'SendMessage'
MessageEvent.Parent = Folder

local GetDataFunc = Instance.new('RemoteFunction')
GetDataFunc.Name = 'GetData'
GetDataFunc.Parent = Folder

-- معالجة الرسائل من العميل
MessageEvent.OnServerEvent:Connect(function(player, messageType, data)
    print('[Server] ' .. player.Name .. ': ' .. tostring(messageType))

    if messageType == 'buy_item' then
        local ls = player:FindFirstChild('leaderstats')
        local cash = ls and ls:FindFirstChild('Cash')
        if cash and cash.Value >= data.price then
            cash.Value -= data.price
            MessageEvent:FireClient(player, 'purchase_ok', {itemId=data.itemId})
        else
            MessageEvent:FireClient(player, 'purchase_fail', {reason='floos غير كافية'})
        end
    elseif messageType == 'chat' then
        -- إذاعة الرسالة لجميع اللاعبين
        for _, p in ipairs(Players:GetPlayers()) do
            MessageEvent:FireClient(p, 'chat', {player=player.Name, msg=data.msg})
        end
    end
end)

-- إرجاع بيانات
GetDataFunc.OnServerInvoke = function(player, req)
    if req == 'stats' then
        local ls = player:FindFirstChild('leaderstats')
        return {
            cash = ls and ls:FindFirstChild('Cash') and ls.Cash.Value or 0,
            level = ls and ls:FindFirstChild('Level') and ls.Level.Value or 1
        }
    end
end

print('[Remote] System loaded!')`;

const CODE_DATASTORE = `-- ═══════════════════════════════════════
-- DataStoreService كامل
-- ═══════════════════════════════════════

local Players = game:GetService('Players')
local DSS = game:GetService('DataStoreService')
local store = DSS:GetDataStore('PlayerData_v1')

local DataManager = {}
DataManager.Cache = {}

function DataManager:Load(player)
    local key = 'player_' .. player.UserId
    local ok, data = pcall(function() return store:GetAsync(key) end)
    if ok and data then
        self.Cache[player.UserId] = data
    else
        self.Cache[player.UserId] = {coins=100, level=1, inventory={}}
    end
    self:UpdateLS(player)
    print('[Data] Loaded: ' .. player.Name)
end

function DataManager:Save(player)
    local d = self.Cache[player.UserId]
    if not d then return end
    local key = 'player_' .. player.UserId
    pcall(function() store:SetAsync(key, d) end)
    print('[Data] Saved: ' .. player.Name)
end

function DataManager:Get(player)
    return self.Cache[player.UserId]
end

function DataManager:Set(player, key, value)
    local d = self.Cache[player.UserId]
    if d then d[key] = value; self:UpdateLS(player) end
end

function DataManager:Increment(player, key, amount)
    local d = self.Cache[player.UserId]
    if d then d[key] = (d[key] or 0) + amount; self:UpdateLS(player) end
end

function DataManager:UpdateLS(player)
    local d = self.Cache[player.UserId]
    if not d then return end
    local ls = player:FindFirstChild('leaderstats')
    if ls then
        if ls:FindFirstChild('Coins') then ls.Coins.Value = d.coins or 0 end
        if ls:FindFirstChild('Level') then ls.Level.Value = d.level or 1 end
    end
end

Players.PlayerAdded:Connect(function(p) DataManager:Load(p) end)
Players.PlayerRemoving:Connect(function(p) DataManager:Save(p); DataManager.Cache[p.UserId] = nil end)
game:BindToClose(function() for _, p in ipairs(Players:GetPlayers()) do DataManager:Save(p) end end)

print('[DataStore] System loaded!')`;

const CODE_TELEPORT = `-- ═══════════════════════════════════════
-- نظام النقل بين الألعاب
-- ═══════════════════════════════════════

local Players = game:GetService('Players')
local TeleportService = game:GetService('TeleportService')
local RS = game:GetService('ReplicatedStorage')

local TeleEvent = Instance.new('RemoteEvent')
TeleEvent.Name = 'TeleportEvent'
TeleEvent.Parent = RS

local Locations = {
    {name='المنزل', placeId=123456789, desc='العودة للمنزل', levelReq=1},
    {name='غابة الأبطال', placeId=987654321, desc='مغامرات', levelReq=5},
    {name='قلعة الظل', placeId=456789123, desc='أسرار مظلمة', levelReq=10},
    {name='مدينة المستقبل', placeId=321654987, desc='تقنية متقدمة', levelReq=20}
}

TeleEvent.OnServerEvent:Connect(function(player, locName)
    local loc = nil
    for _, l in ipairs(Locations) do
        if l.name == locName then loc = l; break end
    end
    if not loc then TeleEvent:FireClient(player, false, 'المكان غير موجود!') return end

    local ls = player:FindFirstChild('leaderstats')
    local lv = ls and ls:FindFirstChild('Level')
    if lv and lv.Value < loc.levelReq then
        TeleEvent:FireClient(player, false, 'تحتاج ليفل ' .. loc.levelReq)
        return
    end

    local ok, err = pcall(function()
        TeleportService:Teleport(loc.placeId, player)
    end)
    if ok then
        TeleEvent:FireClient(player, true, 'جاري النقل...')
    else
        TeleEvent:FireClient(player, false, 'فشل: ' .. tostring(err))
    end
end)

local GetLocEvent = Instance.new('RemoteEvent')
GetLocEvent.Name = 'GetLocations'
GetLocEvent.Parent = RS
GetLocEvent.OnServerEvent:Connect(function(p)
    GetLocEvent:FireClient(p, Locations)
end)

print('[Teleport] Loaded! ' .. #Locations .. ' locations')`;

const CODE_TIMER = `-- ═══════════════════════════════════════
-- نظام مؤقت كامل
-- ═══════════════════════════════════════

local Players = game:GetService('Players')
local RS = game:GetService('ReplicatedStorage')

local TimerEvent = Instance.new('RemoteEvent')
TimerEvent.Name = 'TimerUpdate'
TimerEvent.Parent = RS

local TimerSystem = {}
TimerSystem.Timers = {}

function TimerSystem:Create(name, duration, callback)
    self.Timers[name] = {remaining=duration, running=true}
    task.spawn(function()
        while self.Timers[name] and self.Timers[name].running do
            for _, p in ipairs(Players:GetPlayers()) do
                TimerEvent:FireClient(p, {
                    name=name,
                    remaining=self.Timers[name].remaining,
                    duration=duration,
                    formatted=self:Format(self.Timers[name].remaining)
                })
            end
            if self.Timers[name].remaining <= 0 then
                self.Timers[name].running = false
                if callback then callback() end
                break
            end
            self.Timers[name].remaining -= 1
            task.wait(1)
        end
    end)
end

function TimerSystem:Stop(name)
    if self.Timers[name] then self.Timers[name].running = false end
end

function TimerSystem:Format(s)
    return string.format('%02d:%02d', math.floor(s/60), s%60)
end

-- أمثلة
TimerSystem:Create('Round', 300, function() print('Round ended!') end)
TimerSystem:Create('Intermission', 15, function() print('Intermission done!') end)

print('[Timer] Loaded!')`;

const CODE_DIALOG = `-- ═══════════════════════════════════════
-- نظام محادثة/حوار
-- ═══════════════════════════════════════

local Players = game:GetService('Players')
local RS = game:GetService('ReplicatedStorage')

local DialogEvents = Instance.new('Folder')
DialogEvents.Name = 'DialogEvents'
DialogEvents.Parent = RS

local StartDlgEvent = Instance.new('RemoteEvent')
StartDlgEvent.Name = 'StartDialog'
StartDlgEvent.Parent = DialogEvents

local ChoiceEvent = Instance.new('RemoteEvent')
ChoiceEvent.Name = 'DialogChoice'
ChoiceEvent.Parent = DialogEvents

local EndDlgEvent = Instance.new('RemoteEvent')
EndDlgEvent.Name = 'EndDialog'
EndDlgEvent.Parent = DialogEvents

local Dialogs = {
    ['npc1'] = {
        speaker = 'الحكيم',
        lines = {
            {text='مرحباً بك يا بطل!', choices={{text='مرحباً!', next=2}, {text='من أنت؟', next=3}}},
            {text='كيف حالك؟', choices={{text='بخير', next=4}, {text='أحتاج مساعدة', next=5}}},
            {text='أنا الحكيم!', choices={{text='تشرفنا!', next=1}, {text='وداعاً', next=-1}}},
            {text='هذا جيد! تفضل مكافأة.', action=function(p)
                local ls=p:FindFirstChild('leaderstats')
                local c=ls and ls:FindFirstChild('Cash')
                if c then c.Value+=500 end
                return true, 'حصلت على $500!'
            end, choices={{text='شكراً!', next=-1}}},
            {text='اذهب لغابة الأبطال.', choices={{text='سأذهب!', next=-1}, {text='ليس الآن', next=1}}}
        }
    }
}

local ActiveDialogs = {}

StartDlgEvent.OnServerEvent:Connect(function(player, npcId)
    local dlg = Dialogs[npcId]
    if not dlg then return end
    ActiveDialogs[player.UserId] = {id=npcId, line=1}
    local ld = dlg.lines[1]
    StartDlgEvent:FireClient(player, {speaker=dlg.speaker, text=ld.text, choices=ld.choices})
end)

ChoiceEvent.OnServerEvent:Connect(function(player, idx)
    local act = ActiveDialogs[player.UserId]
    if not act then return end
    local dlg = Dialogs[act.id]
    local ld = dlg.lines[act.line]
    local choice = ld.choices[idx]
    if not choice then return end

    if ld.action then
        local ok, msg = ld.action(player)
        if msg then ChoiceEvent:FireClient(player, {actionMsg=msg}) end
    end

    if choice.next == -1 then
        ActiveDialogs[player.UserId] = nil
        EndDlgEvent:FireClient(player)
    else
        act.line = choice.next
        local nl = dlg.lines[choice.next]
        StartDlgEvent:FireClient(player, {speaker=dlg.speaker, text=nl.text, choices=nl.choices})
    end
end)

Players.PlayerRemoving:Connect(function(p) ActiveDialogs[p.UserId] = nil end)
print('[Dialog] Loaded!')`;

const CODE_RAINBOW = `-- ═══════════════════════════════════════
-- جسيم قوس قزح متحرك
-- ═══════════════════════════════════════

local RunService = game:GetService('RunService')

local part = workspace:FindFirstChild('RainbowPart')
if not part then
    part = Instance.new('Part')
    part.Name = 'RainbowPart'
    part.Size = Vector3.new(4, 4, 4)
    part.Position = Vector3.new(0, 10, 0)
    part.Anchored = true
    part.Material = Enum.Material.Neon
    part.Parent = workspace
end

local hue = 0
RunService.Heartbeat:Connect(function(dt)
    hue = (hue + dt) % 1
    part.Color = Color3.fromHSV(hue, 1, 1)
end)

print('[Rainbow] Part activated!')`;

const CODE_KILL = `-- ═══════════════════════════════════════
-- جسيم القتل
-- ═══════════════════════════════════════

local debounce = {}

local killBrick = workspace:FindFirstChild('KillBrick')
if not killBrick then
    killBrick = Instance.new('Part')
    killBrick.Name = 'KillBrick'
    killBrick.Size = Vector3.new(8, 1, 8)
    killBrick.Position = Vector3.new(0, 0.5, 0)
    killBrick.Anchored = true
    killBrick.BrickColor = BrickColor.new('Bright red')
    killBrick.Material = Enum.Material.Neon
    killBrick.Parent = workspace
end

killBrick.Touched:Connect(function(hit)
    local char = hit.Parent
    local h = char and char:FindFirstChild('Humanoid')
    if h and not debounce[char] then
        debounce[char] = true
        h.Health = 0
        task.delay(1, function() debounce[char] = nil end)
    end
end)

print('[KillBrick] Loaded!')`;

const CODE_NOCLIP = `-- ═══════════════════════════════════════
-- Noclip - LocalScript في StarterPlayerScripts
-- ═══════════════════════════════════════

local Players = game:GetService('Players')
local RunService = game:GetService('RunService')
local UIS = game:GetService('UserInputService')

local player = Players.LocalPlayer
local noclip = false
local conn = nil

UIS.InputBegan:Connect(function(input, gp)
    if gp then return end
    if input.KeyCode == Enum.KeyCode.N then
        noclip = not noclip
        if noclip then
            conn = RunService.Stepped:Connect(function()
                local c = player.Character
                if c then
                    for _, p in ipairs(c:GetDescendants()) do
                        if p:IsA('BasePart') then p.CanCollide = false end
                    end
                end
            end)
            print('[Noclip] ON')
        else
            if conn then conn:Disconnect(); conn = nil end
            print('[Noclip] OFF')
        end
    end
end)

print('[Noclip] Press N')`;

const CODE_SPEED = `-- ═══════════════════════════════════════
-- تعزيز السرعة
-- ═══════════════════════════════════════

local Players = game:GetService('Players')
local RS = game:GetService('ReplicatedStorage')

local SpeedEvent = Instance.new('RemoteEvent')
SpeedEvent.Name = 'SpeedBoost'
SpeedEvent.Parent = RS

local function applySpeed(player, mult, dur)
    local c = player.Character
    if not c then return end
    local h = c:FindFirstChild('Humanoid')
    if not h then return end
    local orig = h.WalkSpeed
    h.WalkSpeed = orig * mult
    task.delay(dur, function()
        if h and h.Parent then h.WalkSpeed = orig end
    end)
end

SpeedEvent.OnServerEvent:Connect(function(player, speedType)
    if speedType == 'fast' then applySpeed(player, 2, 10)
    elseif speedType == 'super' then applySpeed(player, 3, 5)
    end
end)

print('[Speed] Loaded!')`;

const CODE_FLY = `-- ═══════════════════════════════════════
-- الطيران - LocalScript في StarterPlayerScripts
-- ═══════════════════════════════════════

local Players = game:GetService('Players')
local RunService = game:GetService('RunService')
local UIS = game:GetService('UserInputService')

local player = Players.LocalPlayer
local flying = false
local flySpeed = 50
local bodyV, bodyG

local keys = {W=false, A=false, S=false, D=false, Space=false, LCtrl=false}

local function startFly()
    local c = player.Character
    if not c then return end
    local hrp = c:FindFirstChild('HumanoidRootPart')
    if not hrp then return end
    flying = true
    bodyV = Instance.new('BodyVelocity')
    bodyV.MaxForce = Vector3.new(1e9, 1e9, 1e9)
    bodyV.Velocity = Vector3.new(0,0,0)
    bodyV.Parent = hrp
    bodyG = Instance.new('BodyGyro')
    bodyG.MaxTorque = Vector3.new(1e9, 1e9, 1e9)
    bodyG.P = 9000; bodyG.D = 500
    bodyG.Parent = hrp
end

local function stopFly()
    flying = false
    if bodyV then bodyV:Destroy() end
    if bodyG then bodyG:Destroy() end
end

UIS.InputBegan:Connect(function(input, gp)
    if gp then return end
    if input.KeyCode == Enum.KeyCode.F then
        if flying then stopFly() else startFly() end
    end
    if input.KeyCode == Enum.KeyCode.W then keys.W = true end
    if input.KeyCode == Enum.KeyCode.A then keys.A = true end
    if input.KeyCode == Enum.KeyCode.S then keys.S = true end
    if input.KeyCode == Enum.KeyCode.D then keys.D = true end
    if input.KeyCode == Enum.KeyCode.Space then keys.Space = true end
    if input.KeyCode == Enum.KeyCode.LeftControl then keys.LCtrl = true end
end)

UIS.InputEnded:Connect(function(input)
    if input.KeyCode == Enum.KeyCode.W then keys.W = false end
    if input.KeyCode == Enum.KeyCode.A then keys.A = false end
    if input.KeyCode == Enum.KeyCode.S then keys.S = false end
    if input.KeyCode == Enum.KeyCode.D then keys.D = false end
    if input.KeyCode == Enum.KeyCode.Space then keys.Space = false end
    if input.KeyCode == Enum.KeyCode.LeftControl then keys.LCtrl = false end
end)

RunService.Heartbeat:Connect(function()
    if not flying then return end
    local cam = workspace.CurrentCamera
    local dir = Vector3.new(0,0,0)
    if keys.W then dir += cam.CFrame.LookVector end
    if keys.S then dir -= cam.CFrame.LookVector end
    if keys.A then dir -= cam.CFrame.RightVector end
    if keys.D then dir += cam.CFrame.RightVector end
    if keys.Space then dir += Vector3.new(0,1,0) end
    if keys.LCtrl then dir -= Vector3.new(0,1,0) end
    if dir.Magnitude > 0 then dir = dir.Unit * flySpeed end
    bodyV.Velocity = dir
    bodyG.CFrame = cam.CFrame
end)

print('[Fly] Press F')`;

const CODE_LEADERBOARD = `-- ═══════════════════════════════════════
-- لوحة صدارة
-- ═══════════════════════════════════════

local Players = game:GetService('Players')

Players.PlayerAdded:Connect(function(player)
    local ls = Instance.new('Folder')
    ls.Name = 'leaderstats'
    ls.Parent = player

    local coins = Instance.new('IntValue')
    coins.Name = 'Coins'; coins.Value = 100; coins.Parent = ls

    local level = Instance.new('IntValue')
    level.Name = 'Level'; level.Value = 1; level.Parent = ls

    local kills = Instance.new('IntValue')
    kills.Name = 'Kills'; kills.Value = 0; kills.Parent = ls

    print('[Leaderboard] Init for ' .. player.Name)
end)

print('[Leaderboard] Loaded!')`;

const CODE_TWEEN = `-- ═══════════════════════════════════════
-- أمثلة TweenService
-- ═══════════════════════════════════════

local TS = game:GetService('TweenService')

-- حركة بسيطة
local function movePart(part, targetPos)
    local info = TweenInfo.new(2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
    local tween = TS:Create(part, info, {Position = targetPos})
    tween:Play()
    return tween
end

-- تغيير لون
local function colorPart(part, targetColor)
    local tween = TS:Create(part, TweenInfo.new(0.5), {Color = targetColor})
    tween:Play()
end

-- تأثير متسلسل
local function chainTweens(part)
    local t1 = TS:Create(part, TweenInfo.new(1), {Position = Vector3.new(0, 20, 0)})
    local t2 = TS:Create(part, TweenInfo.new(1), {Size = Vector3.new(8, 8, 8)})
    local t3 = TS:Create(part, TweenInfo.new(1), {Transparency = 0.5})
    t1:Play(); t1.Completed:Wait()
    t2:Play(); t2.Completed:Wait()
    t3:Play()
end

movePart(workspace.Part, Vector3.new(0, 20, 0))`;

const CODE_PATHFINDING = `-- ═══════════════════════════════════════
-- PathfindingService
-- ═══════════════════════════════════════

local PS = game:GetService('PathfindingService')

local function findPath(startPos, endPos)
    local path = PS:CreatePath({
        AgentRadius = 2,
        AgentHeight = 5,
        AgentCanJump = true
    })
    local ok, err = pcall(function() path:ComputeAsync(startPos, endPos) end)
    if ok and path.Status == Enum.PathStatus.Success then
        return path:GetWaypoints()
    end
    warn('Path failed: ' .. tostring(err))
    return nil
end

local function followPath(character, waypoints)
    local h = character:FindFirstChild('Humanoid')
    if not h then return end
    for _, wp in ipairs(waypoints) do
        h:MoveTo(wp.Position)
        h.MoveToFinished:Wait()
    end
end`;

const CODE_COLLECTION = `-- ═══════════════════════════════════════
-- CollectionService
-- ═══════════════════════════════════════

local CS = game:GetService('CollectionService')

CS:AddTag(workspace.Part, 'Collectible')

local items = CS:GetTagged('Collectible')
for _, item in ipairs(items) do
    print('Found: ' .. item.Name)
end

CS:GetInstanceAddedSignal('Collectible'):Connect(function(inst)
    print('Added: ' .. inst.Name)
end)`;

const CODE_GAMEPASS = `-- ═══════════════════════════════════════
-- Game Pass
-- ═══════════════════════════════════════

local MPS = game:GetService('MarketplaceService')
local Players = game:GetService('Players')

local PASSES = {VIP=12345678, DoubleCash=23456789, Speed=34567890}

local function hasPass(player, id)
    local ok, has = pcall(function()
        return MPS:UserOwnsGamePassAsync(player.UserId, id)
    end)
    return ok and has
end

Players.PlayerAdded:Connect(function(player)
    for name, id in pairs(PASSES) do
        if hasPass(player, id) then
            print(player.Name .. ' owns ' .. name)
        end
    end
end)`;

const CODE_INVENTORY = `-- ═══════════════════════════════════════
-- نظام حقيبة بسيط
-- ModuleScript
-- ═══════════════════════════════════════

local Inventory = {}
Inventory.__index = Inventory

function Inventory.new(maxSize)
    return setmetatable({items={}, maxSize=maxSize or 20}, Inventory)
end

function Inventory:Add(name, qty)
    qty = qty or 1
    if #self.items >= self.maxSize then warn('Full!'); return false end
    for _, it in ipairs(self.items) do
        if it.name == name then it.qty = it.qty + qty; return true end
    end
    table.insert(self.items, {name=name, qty=qty})
    return true
end

function Inventory:Remove(name, qty)
    qty = qty or 1
    for i, it in ipairs(self.items) do
        if it.name == name then
            it.qty = it.qty - qty
            if it.qty <= 0 then table.remove(self.items, i) end
            return true
        end
    end
    return false
end

function Inventory:Has(name, qty)
    qty = qty or 1
    for _, it in ipairs(self.items) do
        if it.name == name and it.qty >= qty then return true end
    end
    return false
end

function Inventory:GetItems() return self.items end

return Inventory`;

const CODE_PART = `-- ═══════════════════════════════════════
-- إنشاء Part
-- ═══════════════════════════════════════

local part = Instance.new('Part')
part.Name = 'CustomPart'
part.Size = Vector3.new(4, 1, 4)
part.Position = Vector3.new(0, 10, 0)
part.Anchored = true
part.CanCollide = true
part.Transparency = 0
part.BrickColor = BrickColor.new('Bright blue')
part.Material = Enum.Material.Neon
part.Shape = Enum.PartType.Block
part.Parent = workspace`;

const CODE_RESPAWN = `-- ═══════════════════════════════════════
-- إعادة الظهور
-- ═══════════════════════════════════════

local Players = game:GetService('Players')

Players.PlayerAdded:Connect(function(player)
    player.CharacterAdded:Connect(function(char)
        local h = char:WaitForChild('Humanoid')
        h.Died:Connect(function()
            task.wait(5)
            player:LoadCharacter()
        end)
    end)
end)

print('[Respawn] Loaded!')`;
