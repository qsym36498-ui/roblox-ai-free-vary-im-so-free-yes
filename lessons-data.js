const LESSONS_DATA = {
    basics: [
        {title: 'مقدمة في Lua/Luau', desc: 'تعلم أساسيات لغة Lua ولغة Luau المستخدمة في Roblox', tags: ['Lua', 'Luau', 'أساسي'],
         content: `<h2>مقدمة في Lua/Luau</h2>
<h3>ما هي Lua؟</h3>
<p>Lua هي لغة برمجة خفيفة وسريعة تُستخدم في很多 الألعاب وتطبيقات Roblox.</p>
<h3>Luau</h3>
<p>Luau هي نسخة محسّنة من Lua من Roblox، تدعم أنواع البيانات و_types.</p>
<h3>مثال أساسي</h3>
<pre><code>-- تعريف متغير
local name = "Ahmed"
local age = 25
local isStudent = true

-- طباعة
print("مرحباً " .. name)
print("العمر: " .. age)

-- شرط
if age > 18 then
    print("بالغ")
else
    print("قاصر")
end

-- حلقة
for i = 1, 10 do
    print(i)
end</code></pre>
<h3>أنواع البيانات الأساسية</h3>
<ul>
<li><strong>number</strong>: الأرقام (42, 3.14)</li>
<li><strong>string</strong>: النصوص ("مرحباً")</li>
<li><strong>boolean</strong>: true أو false</li>
<li><strong>nil</strong>: لا قيمة</li>
<li><strong>table</strong>: الجداول (المصفوفات)</li>
</ul>`},
        {title: 'المتغيرات والثوابت', desc: 'كيفية تعريف واستخدام المتغيرات', tags: ['variables', 'local'],
         content: `<h2>المتغيرات</h2>
<pre><code>-- استخدام local دائماً
local playerName = "Ahmed"
local playerHealth = 100
local isAlive = true

-- لا تستخدم بدون local (سيء!)
-- badVariable = "don't do this"

-- جدول
local playerData = {
    name = "Ahmed",
    health = 100,
    level = 5
}

-- الوصول للبيانات
print(playerData.name) -- Ahmed
print(playerData.health) -- 100

-- تعديل
playerData.health = 75</code></pre>`},
        {title: 'الشروط (If/Else)', desc: 'كيفية استخدام الشروط في البرمجة', tags: ['if', 'condition'],
         content: `<h2>الشروط</h2>
<pre><code>-- if/elseif/else
local health = 75

if health > 80 then
    print("صحي Healthy")
elseif health > 50 then
    print("مصاب قليلاً")
elseif health > 0 then
    print("مصاب بشدة")
else
    print("متى")
end

-- شروط متقدمة
local level = 10
local vip = true

if level >= 10 and vip then
    print("مرحباً محترف VIP!")
elseif level >= 10 then
    print("مرحباً محترف!")
else
    print("مرحباً مبتدئ!")
end

-- التحقق من nil
local part = workspace:FindFirstChild("MyPart")
if part then
    print("Part found!")
end</code></pre>`},
        {title: 'الحلقات (Loops)', desc: 'التكرار في Lua', tags: ['for', 'while', 'loop'],
         content: `<h2>الحلقات</h2>
<pre><code>-- for loop
for i = 1, 10 do
    print(i) -- 1 إلى 10
end

for i = 10, 1, -1 do
    print(i) -- عد تنازلي
end

-- pairs: لكل عنصر في الجدول
local fruits = {apple="تفاح", banana="موز"}
for key, value in pairs(fruits) do
    print(key .. " = " .. value)
end

-- ipairs: لكل عنصر مرتب
local nums = {10, 20, 30}
for index, value in ipairs(nums) do
    print(index, value)
end

-- while
local count = 0
while count < 5 do
    count += 1
    print(count)
end

-- repeat/until
local x = 0
repeat
    x += 1
until x >= 5</code></pre>`},
        {title: 'الدوال (Functions)', desc: 'كيفية تعريف واستدعاء الدوال', tags: ['function', 'return'],
         content: `<h2>الدوال</h2>
<pre><code>-- دالة بسيطة
local function greet(name)
    print("مرحباً " .. name)
end

greet("Ahmed") -- مرحباً Ahmed

-- دالة ترجع قيمة
local function add(a, b)
    return a + b
end

local result = add(5, 3) -- 8

-- دالة مع قيم افتراضية
local function heal(player, amount)
    amount = amount or 25 -- افتراضي 25
    local h = player.Character:FindFirstChild("Humanoid")
    if h then
        h.Health = math.min(h.Health + amount, h.MaxHealth)
    end
end

-- دالة مع أعداد متغيرة
local function sum(...)
    local total = 0
    for _, v in ipairs({...}) do
        total += v
    end
    return total
end

print(sum(1, 2, 3, 4)) -- 10</code></pre>`}
    ],
    roblox: [
        {title: 'Instance الأساسي', desc: 'إنشاء وتعديل الكائنات في Roblox', tags: ['Instance', 'Part', 'Create'],
         content: `<h2>Instance - الكائن الأساسي</h2>
<pre><code>-- إنشاء جسيم
local part = Instance.new("Part")
part.Name = "MyPart"
part.Size = Vector3.new(4, 1, 4)
part.Position = Vector3.new(0, 10, 0)
part.Anchored = true
part.BrickColor = BrickColor.new("Bright blue")
part.Parent = workspace

-- إنشاء موديل
local model = Instance.new("Model")
model.Name = "MyModel"
part.Parent = model
model.PrimaryPart = part
model.Parent = workspace

-- نسخ كائن
local clone = part:Clone()
clone.Position = Vector3.new(10, 10, 0)
clone.Parent = workspace

-- حذف كائن
part:Destroy()

-- البحث عن كائن
local found = workspace:FindFirstChild("MyPart")
if found then
    print(found.Name)
end

-- انتظار كائن
local waited = workspace:WaitForChild("MyPart", 10)
if waited then
    print("Found after waiting!")
end

-- جلب كل الأبناء
local children = workspace:GetChildren()
for _, child in ipairs(children) do
    print(child.Name)
end</code></pre>`},
        {title: 'Vector3 و CFrame', desc: 'أنظمة الإحداثيات في Roblox', tags: ['Vector3', 'CFrame', 'Position'],
         content: `<h2>Vector3</h2>
<pre><code>-- إنشاء Vector3
local pos = Vector3.new(1, 2, 3)
print(pos.X, pos.Y, pos.Z)

-- اختصارات
local zero = Vector3.zero
local one = Vector3.one
local up = Vector3.yAxis

-- عمليات
local a = Vector3.new(1, 0, 0)
local b = Vector3.new(0, 1, 0)
print(a + b) -- (1, 1, 0)
print(a.Magnitude) -- المسافة
print(a.Unit) -- المتجه الوحدي</code></pre>
<h2>CFrame</h2>
<pre><code>-- موقع
local cf = CFrame.new(0, 10, 0)

-- دوران
local rot = CFrame.Angles(0, math.rad(90), 0)

-- دمج两者
local full = CFrame.new(0, 10, 0) * CFrame.Angles(0, math.rad(90), 0)

-- تطبيق على جسيم
part.CFrame = full

-- الحصول على الموقع
local pos = part.CFrame.Position
local rot = part.CFrame.Rotation

-- LookVector (اتجاه النظر)
local look = part.CFrame.LookVector</code></pre>`},
        {title: 'Color3 والألوان', desc: 'تعامل مع الألوان', tags: ['Color3', 'Color', 'BrickColor'],
         content: `<h2>الألوان</h2>
<pre><code>-- Color3 (0 إلى 1)
local red = Color3.new(1, 0, 0)
local blue = Color3.new(0, 0, 1)

-- RGB (0 إلى 255)
local green = Color3.fromRGB(0, 255, 0)

-- HSV
local purple = Color3.fromHSV(0.75, 1, 1)

-- BrickColor
local bc = BrickColor.new("Bright red")

-- تطبيق اللون
part.BrickColor = bc
part.Color = green</code></pre>`}
    ],
    gui: [
        {title: 'إنشاء واجهة GUI', desc: 'بناء واجهات مستخدم تفاعلية', tags: ['GUI', 'ScreenGui', 'Frame'],
         content: `<h2>إنشاء GUI</h2>
<pre><code>-- ScreenGui
local gui = Instance.new("ScreenGui")
gui.Parent = player.PlayerGui

-- Frame
local frame = Instance.new("Frame")
frame.Size = UDim2.new(0.3, 0, 0.3, 0)
frame.Position = UDim2.new(0.5, 0, 0.5, 0)
frame.AnchorPoint = Vector2.new(0.5, 0.5)
frame.BackgroundColor3 = Color3.fromRGB(30, 40, 60)
frame.Parent = gui

-- TextLabel
local label = Instance.new("TextLabel")
label.Size = UDim2.new(1, 0, 0, 40)
label.Text = "مرحباً!"
label.TextColor3 = Color3.new(1, 1, 1)
label.TextSize = 24
label.BackgroundTransparency = 1
label.Parent = frame

-- TextButton
local button = Instance.new("TextButton")
button.Size = UDim2.new(0.8, 0, 0, 40)
button.Position = UDim2.new(0.1, 0, 0.6, 0)
button.Text = "اضغط هنا!"
button.BackgroundColor3 = Color3.fromRGB(0, 120, 215)
button.TextColor3 = Color3.new(1, 1, 1)
button.Parent = frame

button.MouseButton1Click:Connect(function()
    print("Clicked!")
end)</code></pre>`},
        {title: 'UDim2 والتخطيط', desc: 'كيفية تحديد أحجام ومواقع عناصر GUI', tags: ['UDim2', 'Layout'],
         content: `<h2>UDim2</h2>
<pre><code>-- UDim2.new(ScaleX, OffsetX, ScaleY, OffsetY)
-- Scale: نسبة مئوية (0 إلى 1)
-- Offset: بكسل

-- 50% من العرض والارتفاع
frame.Size = UDim2.new(0.5, 0, 0.5, 0)

-- 200 بكسل عرض و100 ارتفاع
frame.Size = UDim2.new(0, 200, 0, 100)

-- في منتصف الشاشة
frame.Position = UDim2.new(0.5, 0, 0.5, 0)
frame.AnchorPoint = Vector2.new(0.5, 0.5)</code></pre>`}
    ],
    events: [
        {title: 'الحدث والاتصال', desc: 'كيفية إنشاء ومعالجة الأحداث', tags: ['Events', 'Connect', 'Signal'],
         content: `<h2>الأحداث</h2>
<pre><code>-- حدث على كائن
part.Touched:Connect(function(hit)
    print("Touched by: " .. hit.Name)
end)

-- حدث مع فصل
local conn
conn = part.Touched:Connect(function(hit)
    print("First touch only!")
    conn:Disconnect()
end)

-- استبدال wait بـ task
task.wait(1)
task.spawn(function()
    print("Runs in parallel")
end)
task.delay(5, function()
    print("Runs after 5 seconds")
end)</code></pre>`},
        {title: 'RemoteEvent', desc: 'التواصل بين الخادم والعميل', tags: ['RemoteEvent', 'Client', 'Server'],
         content: `<h2>RemoteEvent</h2>
<pre><code>-- Server Script
local RS = game:GetService("ReplicatedStorage")
local event = Instance.new("RemoteEvent")
event.Name = "MyEvent"
event.Parent = RS

event.OnServerEvent:Connect(function(player, data)
    print(player.Name .. " sent: " .. data)
end)

-- Client Script
local RS = game:GetService("ReplicatedStorage")
local event = RS:WaitForChild("MyEvent")

event:FireServer("Hello from client!")

event.OnClientEvent:Connect(function(data)
    print("Server sent: " .. data)
end)</code></pre>`}
    ],
    advanced: [
        {title: 'DataStoreService', desc: 'حفظ بيانات اللاعبين', tags: ['DataStore', 'Save', 'Load'],
         content: `<h2>DataStoreService</h2>
<pre><code>local DSS = game:GetService("DataStoreService")
local store = DSS:GetDataStore("PlayerData")

-- حفظ
local function save(player)
    local key = "player_" .. player.UserId
    pcall(function()
        store:SetAsync(key, {coins = 100, level = 1})
    end)
end

-- تحميل
local function load(player)
    local key = "player_" .. player.UserId
    local ok, data = pcall(function()
        return store:GetAsync(key)
    end)
    if ok and data then
        return data
    end
    return {coins = 0, level = 1}
end</code></pre>`},
        {title: 'TweenService', desc: 'حركات سلسة', tags: ['Tween', 'Animation'],
         content: `<h2>TweenService</h2>
<pre><code>local TS = game:GetService("TweenService")

local info = TweenInfo.new(
    2, -- المدة
    Enum.EasingStyle.Quad,
    Enum.EasingDirection.Out,
    0, -- التكرارات
    false, -- العودة
    0 -- التأخير
)

local tween = TS:Create(part, info, {
    Position = Vector3.new(0, 20, 0),
    Color = Color3.new(1, 0, 0)
})

tween:Play()

tween.Completed:Connect(function()
    print("Tween finished!")
end)</code></pre>`},
        {title: 'PathfindingService', desc: 'إيجاد المسارات', tags: ['Pathfinding', 'Navigation'],
         content: `<h2>PathfindingService</h2>
<pre><code>local PS = game:GetService("PathfindingService")

local path = PS:CreatePath({
    AgentRadius = 2,
    AgentHeight = 5,
    AgentCanJump = true
})

path:ComputeAsync(startPos, endPos)

if path.Status == Enum.PathStatus.Success then
    local waypoints = path:GetWaypoints()
    for _, wp in ipairs(waypoints) do
        humanoid:MoveTo(wp.Position)
        humanoid.MoveToFinished:Wait()
    end
end</code></pre>`}
    ],
    patterns: [
        {title: 'أنماط التصميم الشائعة', desc: 'أنماط برمجية مفيدة', tags: ['Patterns', 'Design'],
         content: `<h2>أنماط التصميم</h2>
<pre><code>-- 1. Singleton Pattern
local MyModule = {}
MyModule.__index = MyModule

function MyModule.new()
    return setmetatable({}, MyModule)
end

-- 2. Observer Pattern
local Signal = {}
Signal.__index = Signal

function Signal.new()
    return setmetatable({connections = {}}, Signal)
end

-- 3. Command Pattern
local commands = {}
commands.heal = function(player, amount)
    player.Character.Humanoid.Health += amount
end
commands.kill = function(player)
    player.Character.Humanoid.Health = 0
end</code></pre>`},
        {title: 'RemoteEvent وال التواصل Client/Server', desc: 'التواصل بين الخادم والعميل بشكل آمن', tags: ['remote', 'client', 'server', 'networking'],
         content: `<h2>RemoteEvent - التواصل Client/Server</h2>
<p>RemoteEvent يسمح بالتواصل بين LocalScript (العميل) و Script (الخادم).</p>
<h3>إنشاء RemoteEvent</h3>
<pre><code>-- في ReplicatedStorage
local RS = game:GetService("ReplicatedStorage")
local event = Instance.new("RemoteEvent")
event.Name = "MyRemoteEvent"
event.Parent = RS</code></pre>
<h3>الخادم (Server Script)</h3>
<pre><code>local RS = game:GetService("ReplicatedStorage")
local event = RS:WaitForChild("MyRemoteEvent")

-- استقبال من العميل
event.OnServerEvent:Connect(function(player, data)
    print(player.Name .. " أرسل: " .. tostring(data))
    -- إعادة بيانات للعميل
    event:FireClient(player, "تم الاستلام!")
end)

-- إرسال لكل العملاء
event:FireAllClients("رسالة للجميع!")</code></pre>
<h3>العميل (LocalScript)</h3>
<pre><code>local RS = game:GetService("ReplicatedStorage")
local event = RS:WaitForChild("MyRemoteEvent")

-- إرسال للخادم
event:FireServer("مرحباً!")

-- استقبال من الخادم
event.OnClientEvent:Connect(function(data)
    print("الخادم قال: " .. data)
end)</code></pre>
<h3>RemoteFunction (لإرجاع قيمة)</h3>
<pre><code>-- Server
local func = RS:WaitForChild("MyRemoteFunc")
func.OnServerInvoke = function(player, request)
    if request == "getTime" then
        return os.time()
    end
    return nil
end

-- Client
local func = RS:WaitForChild("MyRemoteFunc")
local time = func:InvokeServer("getTime")
print("الوقت: " .. time)</code></pre>
<h3>نصائح أمان</h3>
<ul>
<li>التحقق دائماً من بيانات اللاعب على الخادم</li>
<li>لا تثق أبداً بالبيانات القادمة من العميل</li>
<li>استخدم الاسم في RemoteEvent لسهولة التتبع</li>
</ul>`},
        {title: 'TweenService - الحركات السلسة', desc: 'إنشاء حركات وانتقالات جميلة', tags: ['tween', 'animation', 'motion'],
         content: `<h2>TweenService - الحركات السلسة</h2>
<h3>المفهوم الأساسي</h3>
<p>TweenService ينشئ حركات سلسة بين قيمتين خلال وقت محدد.</p>
<pre><code>local TS = game:GetService("TweenService")

-- 1. إنشاء TweenInfo
local info = TweenInfo.new(
    2,                          -- المدة (ثانية)
    Enum.EasingStyle.Quad,      -- نمط الحركة
    Enum.EasingDirection.Out,   -- اتجاه الحركة
    0,                          -- عدد التكرارات
    false,                      -- العودة للأصل
    0                           -- التأخير
)

-- 2. تحديد الأهداف (Goals)
local goals = {
    Position = Vector3.new(0, 20, 0),
    Color = Color3.new(1, 0, 0),
    Transparency = 0.5
}

-- 3. إنشاء وتشغيل
local tween = TS:Create(part, info, goals)
tween:Play()

-- إيقاف
-- tween:Pause()
-- tween:Cancel()</code></pre>
<h3>أنماط الحركة (EasingStyle)</h3>
<ul>
<li><strong>Linear:</strong> حركة ثابتة</li>
<li><strong>Quad:</strong> حركة سلسة خفيفة</li>
<li><strong>Cubic:</strong> حركة أقوى</li>
<li><strong>Bounce:</strong> ارتداد</li>
<li><strong>Elastic:</strong> مرن مثل النابض</li>
<li><strong>Back:</strong> يرجع قليلاً ثم يتحرك</li>
<li><strong>Sine:</strong> مثل موجة الجيب</li>
</ul>
<h3>تسلسل حركات</h3>
<pre><code>local tween1 = TS:Create(part, info, {Position = Vector3.new(10, 10, 0)})
local tween2 = TS:Create(part, info, {Position = Vector3.new(10, 10, 10)})

tween1:Play()
tween1.Completed:Wait()
tween2:Play()</code></pre>
<h3>أحداث مهمة</h3>
<pre><code>tween.Completed:Connect(function(playbackState)
    print("انتهت الحركة: " .. tostring(playbackState))
end)

tween.PlaybackStarted:Connect(function()
    print("بدأت الحركة!")
end)</code></pre>`},
        {title: 'DataStoreService - حفظ البيانات', desc: 'حفظ تقدم اللاعبين بشكل دائم', tags: ['datastore', 'save', 'data'],
         content: `<h2>DataStoreService - حفظ البيانات</h2>
<h3>المفهوم</h3>
<p>DataStoreService يسمح بحفظ البيانات على خوادم Roblox بشكل دائم.</p>
<h3>الأساسيات</h3>
<pre><code>local DSS = game:GetService("DataStoreService")
local store = DSS:GetDataStore("PlayerData")

-- حفظ
store:SetAsync("player_" .. player.UserId, {coins=100, level=1})

-- تحميل
local data = store:GetAsync("player_" .. player.UserId)
if data then
    print(data.coins) -- 100
end</code></pre>
<h3>نظام حفظ كامل</h3>
<pre><code>local Players = game:GetService("Players")
local DSS = game:GetService("DataStoreService")
local store = DSS:GetDataStore("PlayerData")

Players.PlayerAdded:Connect(function(player)
    local key = "player_" .. player.UserId
    local success, data = pcall(function()
        return store:GetAsync(key)
    end)

    -- إنشاء leaderstats
    local ls = Instance.new("Folder")
    ls.Name = "leaderstats"
    ls.Parent = player

    local coins = Instance.new("IntValue")
    coins.Name = "Coins"
    coins.Parent = ls

    if success and data then
        coins.Value = data.coins or 0
    else
        coins.Value = 0
    end
end)

Players.PlayerRemoving:Connect(function(player)
    local key = "player_" .. player.UserId
    local data = {
        coins = player.leaderstats.Coins.Value
    }
    pcall(function()
        store:SetAsync(key, data)
    end)
end)</code></pre>
<h3>نصائح مهمة</h3>
<ul>
<li>استخدم pcall دائماً مع DataStore</li>
<li>لا تحفظ في كل تغيير - استخدم Debounce</li>
<li>احفظ عند PlayerRemoving و ServerShutdown</li>
<li>DataStoreService له حدود الطلبات</li>
</ul>`},
        {title: 'RunService والتحديث المستمر', desc: 'تحديث الأشياء في كل فريم', tags: ['runservice', 'heartbeat', 'render'],
         content: `<h2>RunService - التحديث المستمر</h2>
<h3>Heartbeat</h3>
<p>يُنفذ بعد تحديث الفيزياء في كل فريم.</p>
<pre><code>local RS = game:GetService("RunService")

RS.Heartbeat:Connect(function(deltaTime)
    -- deltaTime = الوقت بين الفريمات (ثانية)
    part.Position += Vector3.new(0, deltaTime * 5, 0)
end)</code></pre>
<h3>RenderStepped</h3>
<p>يُنفذ قبل رسم الفريم (للعميل فقط).</p>
<pre><code>RS.RenderStepped:Connect(function(deltaTime)
    -- تحديث الكاميرا مثلاً
end)</code></pre>
<h3>Stepped</h3>
<p>يُنفذ قبل تحديث الفيزياء.</p>
<pre><code>RS.Stepped:Connect(function(time, deltaTime)
    -- قبل تحديث الفيزياء
end)</code></pre>
<h3>مهمة مستمرة</h3>
<pre><code>task.spawn(function()
    while true do
        -- تحديث كل ثانية
        updateAllPlayers()
        task.wait(1)
    end
end)</code></pre>`},
        {title: 'Mouse و Tool و CFrame', desc: 'التعامل مع الأدوات والماسورة', tags: ['mouse', 'tool', 'cframe'],
         content: `<h2>Mouse و Tool</h2>
<h3>الحصول على الماسورة</h3>
<pre><code>local Players = game:GetService("Players")
local player = Players.LocalPlayer
local mouse = player:GetMouse()

-- عند النقر
mouse.Button1Down:Connect(function()
    local target = mouse.Target
    if target then
        print("نقرت على: " .. target.Name)
    end
end)

-- تتبع حركة الماوس
mouse.Move:Connect(function()
    local pos = mouse.Hit.Position
end)</code></pre>
<h3>Tool basics</h3>
<pre><code>-- في StarterPack
local tool = Instance.new("Tool")
tool.Name = "MyTool"
tool.RequiresHandle = true

tool.Equipped:Connect(function(mouse)
    print("تم تجهيز الأداة!")
end)

tool.Unequipped:Connect(function()
    print("تم إزالة الأداة!")
end)

tool.Activated:Connect(function()
    print("تم تفعيل الأداة!")
end)</code></pre>
<h3>CFrame المتقدم</h3>
<pre><code>-- موقع + دوران
local cf = CFrame.new(0, 10, 0) * CFrame.Angles(0, math.rad(45), 0)

-- النظر لاتجاه معين
local lookCF = CFrame.lookAt(part.Position, target.Position)

-- التحريك بسلاسة
part.CFrame = part.CFrame:Lerp(targetCF, 0.1)

-- حساب المسافة
local dist = (part.Position - target.Position).Magnitude

-- الاتجاه المقابل
local behind = targetCF * CFrame.new(0, 0, 5)</code></pre>`},
        {title: 'Raycast والتصوير', desc: 'إرسال أشعة للكشف عن الأشياء', tags: ['raycast', 'physics', 'collision'],
         content: `<h2>Raycast - التصوير</h2>
<h3>المفهوم</h3>
<p>Raycast يرسل شعاعاً من نقطة لاتجاه معين ويكشف أول شيء يصطدم به.</p>
<pre><code>-- تصوير بسيط
local origin = part.Position
local direction = Vector3.new(0, -50, 0) -- لأسفل
local params = RaycastParams.new()
params.FilterDescendantsInstances = {part}
params.FilterType = Enum.RaycastFilterType.Exclude

local result = workspace:Raycast(origin, direction, params)
if result then
    print("اصطدم بـ: " .. result.Instance.Name)
    print("الموضع: " .. tostring(result.Position))
    print("الاتجاه: " .. tostring(result.Normal))
    print("المسافة: " .. result.Distance)
end</code></pre>
<h3>تصوير الكائنات القريبة</h3>
<pre><code>local origin = HumanoidRootPart.Position
local direction = HumanoidRootPart.CFrame.LookVector * 100

local result = workspace:Raycast(origin, direction, params)
if result then
    local hitPart = result.Instance
    local hitPlayer = Players:GetPlayerFromCharacter(hitPart.Parent)
    if hitPlayer then
        print("أصبت اللاعب: " .. hitPlayer.Name)
    end
end</code></pre>
<h3>CircleCast (للكشف عن الدوائر)</h3>
<pre><code>local circleParams = OverlapParams.new()
circleParams.FilterDescendantsInstances = {character}
circleParams.FilterType = Enum.RaycastFilterType.Exclude

local parts = workspace:GetPartBoundsInRadius(position, radius, circleParams)
for _, part in ipairs(parts) do
    print("في النطاق: " .. part.Name)
end</code></pre>`}
    ]
    ,
    remote: [
        {title: 'RemoteEvent والتواصل Client/Server', desc: 'التواصل بين الخادم والعميل بشكل آمن', tags: ['remote', 'client', 'server', 'networking'],
         content: `<h2>RemoteEvent - التواصل Client/Server</h2>
<p>RemoteEvent يسمح بالتواصل بين LocalScript (العميل) و Script (الخادم).</p>
<h3>إنشاء RemoteEvent</h3>
<pre><code>-- في ReplicatedStorage
local RS = game:GetService("ReplicatedStorage")
local event = Instance.new("RemoteEvent")
event.Name = "MyRemoteEvent"
event.Parent = RS</code></pre>
<h3>الخادم (Server Script)</h3>
<pre><code>local RS = game:GetService("ReplicatedStorage")
local event = RS:WaitForChild("MyRemoteEvent")

-- استقبال من العميل
event.OnServerEvent:Connect(function(player, data)
    print(player.Name .. " أرسل: " .. tostring(data))
    -- إعادة بيانات للعميل
    event:FireClient(player, "تم الاستلام!")
end)

-- إرسال لكل العملاء
event:FireAllClients("رسالة للجميع!")</code></pre>
<h3>العميل (LocalScript)</h3>
<pre><code>local RS = game:GetService("ReplicatedStorage")
local event = RS:WaitForChild("MyRemoteEvent")

-- إرسال للخادم
event:FireServer("مرحباً!")

-- استقبال من الخادم
event.OnClientEvent:Connect(function(data)
    print("الخادم قال: " .. data)
end)</code></pre>
<h3>RemoteFunction (لإرجاع قيمة)</h3>
<pre><code>-- Server
local func = RS:WaitForChild("MyRemoteFunc")
func.OnServerInvoke = function(player, request)
    if request == "getTime" then
        return os.time()
    end
    return nil
end

-- Client
local func = RS:WaitForChild("MyRemoteFunc")
local time = func:InvokeServer("getTime")
print("الوقت: " .. time)</code></pre>
<h3>نصائح أمان</h3>
<ul>
<li>التحقق دائماً من بيانات اللاعب على الخادم</li>
<li>لا تثق أبداً بالبيانات القادمة من العميل</li>
<li>استخدم الاسم في RemoteEvent لسهولة التتبع</li>
</ul>`},
    ],
    tween: [
        {title: 'TweenService - الحركات السلسة', desc: 'إنشاء حركات وانتقالات جميلة', tags: ['tween', 'animation', 'motion'],
         content: `<h2>TweenService - الحركات السلسة</h2>
<h3>المفهوم الأساسي</h3>
<p>TweenService ينشئ حركات سلسة بين قيمتين خلال وقت محدد.</p>
<pre><code>local TS = game:GetService("TweenService")

-- 1. إنشاء TweenInfo
local info = TweenInfo.new(
    2,                          -- المدة (ثانية)
    Enum.EasingStyle.Quad,      -- نمط الحركة
    Enum.EasingDirection.Out,   -- اتجاه الحركة
    0,                          -- عدد التكرارات
    false,                      -- العودة للأصل
    0                           -- التأخير
)

-- 2. تحديد الأهداف (Goals)
local goals = {
    Position = Vector3.new(0, 20, 0),
    Color = Color3.new(1, 0, 0),
    Transparency = 0.5
}

-- 3. إنشاء وتشغيل
local tween = TS:Create(part, info, goals)
tween:Play()

-- إيقاف
-- tween:Pause()
-- tween:Cancel()</code></pre>
<h3>أنماط الحركة (EasingStyle)</h3>
<ul>
<li><strong>Linear:</strong> حركة ثابتة</li>
<li><strong>Quad:</strong> حركة سلسة خفيفة</li>
<li><strong>Cubic:</strong> حركة أقوى</li>
<li><strong>Bounce:</strong> ارتداد</li>
<li><strong>Elastic:</strong> مرن مثل النابض</li>
<li><strong>Back:</strong> يرجع قليلاً ثم يتحرك</li>
<li><strong>Sine:</strong> مثل موجة الجيب</li>
</ul>
<h3>تسلسل حركات</h3>
<pre><code>local tween1 = TS:Create(part, info, {Position = Vector3.new(10, 10, 0)})
local tween2 = TS:Create(part, info, {Position = Vector3.new(10, 10, 10)})

tween1:Play()
tween1.Completed:Wait()
tween2:Play()</code></pre>
<h3>أحداث مهمة</h3>
<pre><code>tween.Completed:Connect(function(playbackState)
    print("انتهت الحركة: " .. tostring(playbackState))
end)

tween.PlaybackStarted:Connect(function()
    print("بدأت الحركة!")
end)</code></pre>`},
    ],
    datastore: [
        {title: 'DataStoreService - حفظ البيانات', desc: 'حفظ تقدم اللاعبين بشكل دائم', tags: ['datastore', 'save', 'data'],
         content: `<h2>DataStoreService - حفظ البيانات</h2>
<h3>المفهوم</h3>
<p>DataStoreService يسمح بحفظ البيانات على خوادم Roblox بشكل دائم.</p>
<h3>الأساسيات</h3>
<pre><code>local DSS = game:GetService("DataStoreService")
local store = DSS:GetDataStore("PlayerData")

-- حفظ
store:SetAsync("player_" .. player.UserId, {coins=100, level=1})

-- تحميل
local data = store:GetAsync("player_" .. player.UserId)
if data then
    print(data.coins) -- 100
end</code></pre>
<h3>نظام حفظ كامل</h3>
<pre><code>local Players = game:GetService("Players")
local DSS = game:GetService("DataStoreService")
local store = DSS:GetDataStore("PlayerData")

Players.PlayerAdded:Connect(function(player)
    local key = "player_" .. player.UserId
    local success, data = pcall(function()
        return store:GetAsync(key)
    end)

    -- إنشاء leaderstats
    local ls = Instance.new("Folder")
    ls.Name = "leaderstats"
    ls.Parent = player

    local coins = Instance.new("IntValue")
    coins.Name = "Coins"
    coins.Parent = ls

    if success and data then
        coins.Value = data.coins or 0
    else
        coins.Value = 0
    end
end)

Players.PlayerRemoving:Connect(function(player)
    local key = "player_" .. player.UserId
    local data = {
        coins = player.leaderstats.Coins.Value
    }
    pcall(function()
        store:SetAsync(key, data)
    end)
end)</code></pre>
<h3>نصائح مهمة</h3>
<ul>
<li>استخدم pcall دائماً مع DataStore</li>
<li>لا تحفظ في كل تغيير - استخدم Debounce</li>
<li>احفظ عند PlayerRemoving و ServerShutdown</li>
<li>DataStoreService له حدود الطلبات</li>
</ul>`},
    ]
};
