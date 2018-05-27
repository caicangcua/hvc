Imports DevExpress.XtraGrid.Columns
Imports System.Reflection
Imports DevExpress.Utils
Imports DevExpress.XtraGrid.Views.Grid.ViewInfo
Imports DevExpress.Skins
Imports DevExpress.LookAndFeel
Imports System.Linq
Imports System.Management
Imports DevExpress.XtraEditors
Imports System.Web.Script.Serialization

Public Class _ProductionPlaning_Dialy1
    Private _helper As AutoHeightHelper = Nothing
    Private _ProductionPlaning_VIEW As _ProductionPlaning_Dialy
    Private SortField As String = ""

    Private _IsTVMode As Boolean = False
    Private _WS As Object
    Private _SwitchReview As Integer = 0
    Private _TotalMonth As DataTable
    Private _LINENAME As DataTable
    '
    Public Property IsTVMode As Boolean
        Get
            Return _IsTVMode
        End Get
        Set(value As Boolean)
            If value Then
                NgayThang.Enabled = False
                ScrollView.Enabled = True
            End If
            _IsTVMode = value
        End Set
    End Property
    Public WriteOnly Property WS As Object
        Set(value As Object)
            _WS = value
        End Set
    End Property
#Region "TIMER"

    Private Sub CrossHairTimer_Tick(sender As Object, e As System.EventArgs) Handles CrossHairTimer.Tick
        CrossHairTimer.Enabled = False
        Try
            Dim offsetX As Integer = dogHair_Left()
            If Not (offsetX = 0 AndAlso Me.Height = 0) Then
                CrossHair.dog_Resize(New Point() {New Point(offsetX, 0), New Point(offsetX, Me.Height)})
            End If
            '
            _SwitchReview += 1
            REAL_DATA()
            '
            If _SwitchReview = Integer.MaxValue Then _SwitchReview = 0
            '
            CrossHairTimer.Tag = Now
            '
            Label1.Text = _SwitchReview

        Catch ex As Exception
            Label1.Text = "CrossHairTimer:" & ex.Message.ToString
        End Try
        CrossHairTimer.Enabled = True
    End Sub
    Private Sub TrackingDayChanged_Tick(sender As System.Object, e As System.EventArgs) Handles TrackingDayChanged.Tick
        If NgayThang.EditValue <> Now.Date Then '--- thay doi ngay
            NgayThang.EditValue = Now.Date
        End If
        '
        If CDate(TrackingDayChanged.Tag).Hour = 4 AndAlso Now.Hour = 5 Then
            RefreshView_ItemClick(Nothing, Nothing)
        End If
        TrackingDayChanged.Tag = Now
    End Sub
    Private Sub ScrollView_Tick(sender As Object, e As System.EventArgs) Handles ScrollView.Tick
        '
        ScrollView.Enabled = False
        '
        If ScrollView.Tag = 0 Then
            '
            ScrollView.Tag = 1
            '
            colNotes_Width()
            '
            GroupBox5.Refresh()
            '
            Application.DoEvents()
            '
        End If
        '
        If Not _IsTVMode Then
            ScrollView.Enabled = False
            gridControl1.BringToFront()
            gridControl1.Dock = DockStyle.Fill
            extendTV.BringToFront()
            CrossHair.BringToFront()
        Else
            Label1.Text = (gridControl1.Height > Me.Height).ToString & ";" & Me.Height.ToString & ";" & gridControl1.Height.ToString
            If gridControl1.Height > Me.Height Then
                If gridControl1.Location.Y <= Me.Height - gridControl1.Height Then
                    ScrollView.Tag = 2
                ElseIf gridControl1.Location.Y >= GroupBox5.Height Then
                    ScrollView.Tag = 1
                End If
                Dim offset As Integer = 1
                If ScrollView.Tag = 2 Then offset = -1
                gridControl1.Location = New Point(gridControl1.Location.X, gridControl1.Location.Y - offset)
            Else
                '
                gridControl1.Left = 0
                gridControl1.Top = GroupBox5.ClientSize.Height
                '
                'gridControl1.Dock = DockStyle.Fill
                extendTV.BringToFront()
                CrossHair.BringToFront()
            End If
        End If
        '
        If _IsTVMode Then ScrollView.Enabled = True
    End Sub

    Private Sub colNotes_Width()
        If _IsTVMode Then
            Dim _W As Integer = gridView1.IndicatorWidth
            For i As Integer = 0 To gridView1.Columns.Count - 2
                If gridView1.Columns(i).Visible Then
                    _W += gridView1.Columns(i).VisibleWidth
                End If
            Next
            If _W < Me.Width Then
                gridView1.Columns("Notes").Width = Me.Width - _W - 5
            Else
                gridView1.Columns("Notes").Width = 0
            End If
            gridView1.LayoutChanged()
            '
            GroupBox5.Refresh()
            Application.DoEvents()
        End If
    End Sub

#End Region

#Region "DOG HAIR LINE"
    Private CrossHair As ZigzagControl
    Private Sub Init_CrossHair()
        Dim offsetX As Integer = dogHair_Left()
        CrossHair = New ZigzagControl(New Point() {New Point(offsetX, 0), New Point(offsetX, Me.Height)}, 1)
        CrossHair.Visible = False
        CrossHair.BackColor = Color.HotPink
        Me.Controls.Add(CrossHair)
        extendTV.BringToFront()
        CrossHair.BringToFront()
    End Sub
    Private Sub Update_CrossHair()
        If CrossHair IsNot Nothing Then
            CrossHair.Visible = False
            If DigitalDisplayControl1.Tag = "1" Then
                'CrossHair.Visible = True
                Dim offsetX As Integer = dogHair_Left()
                CrossHair.dog_Resize(New Point() {New Point(offsetX, 0), New Point(offsetX, Me.Height)})
            Else
                'CrossHair.Visible = False
            End If
        End If
    End Sub
    Private Function dogHair_Left() As Integer
        Dim _offset As Decimal = DigitalDisplayControl1.Width / 60
        Dim Val As Integer = DigitalDisplayControl1.Left + _offset * (CInt(DateDiff(DateInterval.Minute, CDate(Now.ToString("yyyy/MM/dd HH:00")), CDate(Now.ToString("yyyy/MM/dd HH:mm")))) + 1)
        If Val < 0 Then Val = 0
        Return Val
    End Function
#End Region

#Region "FORM"
    Private Sub NgayThang_EditValueChanged(sender As Object, e As System.EventArgs)
        Init()
        RefreshView_ItemClick(Nothing, Nothing)
    End Sub
    Private Sub _ProductionPlaning_Dialy1_HandleDestroyed(sender As Object, e As System.EventArgs) Handles Me.HandleDestroyed
        Try
            _helper.DisableColumnPanelAutoHeight()
            If _ProductionPlaning_VIEW IsNot Nothing AndAlso Not _ProductionPlaning_VIEW.IsDisposed Then _ProductionPlaning_VIEW.Close()
        Catch ex As Exception
            Label1.Text = "_ProductionPlaning_Dialy1_HandleDestroyed:" & ex.Message.ToString
        End Try
    End Sub

    Private Sub _ProductionPlaning_Dialy1_Layout(sender As Object, e As System.Windows.Forms.LayoutEventArgs) Handles Me.Layout
        TransparentPictureBox1.BringToFront()
    End Sub

    Private Sub _ProductionPlaning_Dialy1_Load(sender As Object, e As System.EventArgs) Handles Me.Load
        '
        TrackingDayChanged.Tag = Now.AddDays(-1)
        '
        Try
            '
            RefreshView_ItemClick(Nothing, Nothing)
            Init_CrossHair()
            '
            customResTotal.ControlType = GetType(PPInfo)
            customRepositoryItem1.ControlType = GetType(PPInfo)
            customResNotes.ControlType = GetType(_CurrentMsg)
            DirectCast(customRepositoryItem1.DrawControl, PPInfo).ScaleFont = 2
            '
            NgayThang.EditValue = Now.Date.AddDays(-1)
            Init()
            '
            AddHandler Me.Resize, AddressOf _ProductionPlaning_Dialy1_Resize
            '
            CrossHairTimer.Enabled = True
            '
        Catch ex As Exception
            Label1.Text = "_ProductionPlaning_Dialy1_Load:" & ex.Message.ToString
        End Try

    End Sub
    Private Sub _ProductionPlaning_Dialy1_Resize(sender As Object, e As System.EventArgs)
        Dim offsetX As Integer = dogHair_Left()
        If Not (offsetX = 0 AndAlso Me.Height = 0) Then
            CrossHair.dog_Resize(New Point() {New Point(offsetX, 0), New Point(offsetX, Me.Height)})
        End If
    End Sub
#End Region

#Region "GRID CONTROL1"
    '
    'Private DTAdminMSG As DataTable = Nothing


    Private Sub DisplayComment(ByVal GridDS As DataTable, ByVal MSGDT As DataTable)
        '
        '---- reset comments
        Init_EmotionIcon()
        '
        SyncLock comments
            comments = New Dictionary(Of CommentCoordinates, Msg2LineInfo)
        End SyncLock
        '
        For i As Integer = 0 To GridDS.Rows.Count - 1
            Dim RowID As Decimal = GridDS.Rows(i)("RowID")
            Dim Index As Integer = i
            Dim Site As String = GridDS.Rows(i)("Site").ToString

            GridDS.Rows(Index)("Notes") = DBNull.Value '---- reset
            '
            MSGDT.AsEnumerable.Where(Function(xxx) xxx.Field(Of String)("Site") = Site AndAlso xxx.Field(Of Decimal)("TaskRow") = RowID).ToList.ForEach(
                Sub(fR)
                    Dim MsgInfo As Msg2LineInfo = New JavaScriptSerializer().Deserialize(Of Msg2LineInfo)(fR("MsgBody"))
                    'MsgInfo.StartValid sẽ nhỏ hơn 1 giờ so với Column Field .....
                    If CDate(fR("EachDate")).ToString("yyyy/MM/dd HH:mm") = "2079/06/06 23:59" Then
                        MsgInfo.AdminSite = "Auto message"
                        If MsgInfo.AdminID <> -1 Then
                            Dim R As DataRow = FrameWork.userR.Table.AsEnumerable.Where(Function(dog) dog.Field(Of Integer)("UserID") = MsgInfo.AdminID).FirstOrDefault
                            If R IsNot Nothing Then
                                MsgInfo.AdminSite = R("UserName") & " send Message 2 line ..."
                            Else
                                MsgInfo.AdminSite = "(Unkwnow)" & " send Message 2 line ..."
                            End If
                        End If
                        '
                        Dim Val() As Object = Nothing
                        If MsgInfo.IconID <> -1 AndAlso ImageComboBoxEdit1.Properties.Items.Count > MsgInfo.IconID Then
                            Val = New Object() {MsgInfo, DirectCast(ImageComboBoxEdit1.Properties.SmallImages, DevExpress.Utils.ImageCollection).Images(MsgInfo.IconID)}
                        Else
                            Val = New Object() {MsgInfo}
                        End If
                        GridDS.Rows(Index)("Notes") = Val
                    Else
                        Dim ColName As String = CDate(MsgInfo.StartValid).AddHours(1).ToString("_HHmm")
                        Dim coordinates As New CommentCoordinates(Index, ColName)
                        comments(coordinates) = MsgInfo
                    End If
                End Sub)
        Next
    End Sub

    Delegate Sub Delegatedog_KetQua(ByVal Rst() As Object)
    Private Sub dog_KetQua(ByVal Rst() As Object)
        If Me.InvokeRequired Then
            Me.Invoke(New Delegatedog_KetQua(AddressOf dog_KetQua), New Object() {Rst})
        Else
            Me.Tag = Rst
            REAL_DATA(Me.Tag(0))
        End If
    End Sub
    Private Function LOAD_KETQUA(ByVal HOT As Boolean) As DataTable
        '
        Dim DS As DataTable = Nothing
        If Not _IsTVMode Then
            '
            Dim reObj() As Object
            If HOT OrElse Me.Tag Is Nothing Then
                reObj = New THREAD_RST().GET_RST(NgayThang.DateTime)
                Me.Tag = reObj
            Else
                Dim trd As New System.Threading.Thread(Sub()
                                                           dog_KetQua(New THREAD_RST().GET_RST(NgayThang.DateTime))
                                                       End Sub)
                trd.IsBackground = True
                trd.Start()
            End If
            '
            '
            DS = Me.Tag(0)
            '
            '' ''DS = FrameWork.dbObj.GetDT("EXEC PPVIEWER_PROC '" & NgayThang.DateTime.ToString("yyyy/MM/dd") & "'")
            '' ''Dim MySite As New DataColumn("Site", GetType(System.String)) : MySite.DefaultValue = prjData.LINKSERVER_CONFIG.MYSITE
            '' ''DS.Columns.Add(MySite)

            '' ''Dim _OUTSITEs As Dictionary(Of String, String) = prjData.LINKSERVER_CONFIG.OUTSITEs()
            '' ''For Each Site As KeyValuePair(Of String, String) In _OUTSITEs
            '' ''    Try
            '' ''        Dim EachSite As DataTable = FrameWork.dbObj.GetDT("EXEC PPVIEWER_PROC '" & NgayThang.DateTime.ToString("yyyy/MM/dd") & "'", Site.Value)
            '' ''        If EachSite.Rows.Count > 0 Then
            '' ''            Dim ExSite As New DataColumn("Site", GetType(System.String)) : ExSite.DefaultValue = Site.Key
            '' ''            EachSite.Columns.Add(ExSite)
            '' ''            DS.Merge(EachSite, False)
            '' ''        End If
            '' ''    Catch ex As Exception
            '' ''    End Try
            '' ''Next
            ' '' ''
            '' ''Dim _Notes As New DataColumn("Notes", GetType(System.Object))
            '' ''DS.Columns.Add(_Notes)
            '
            '' ''Me.Tag = New Object() {DS.Copy, Init_AdminMsg(DS, _OUTSITEs).Copy}
        Else
            SyncLock _WS.Tag
                Me.Tag = _WS.Tag
            End SyncLock
            DS = Me.Tag(0)
        End If
        '
        Return DS
    End Function
    '' ''Private Function Init_AdminMsg(ByVal GridDS As DataTable, ByVal _OUTSITEs As Dictionary(Of String, String)) As DataTable
    '' ''    '
    '' ''    Dim MSGDT As DataTable = FrameWork.dbObj.GetDT("Select EachDate,TaskRow,MsgBody From Msg2Line_Run Where (EachDate Between '" & NgayThang.DateTime.ToString("yyyy/MM/dd") & "' And '" & NgayThang.DateTime.AddDays(1).ToString("yyyy/MM/dd") & "') Or EachDate='2079-06-06 23:59'")
    '' ''    Dim MySite As New DataColumn("Site", GetType(System.String)) : MySite.DefaultValue = prjData.LINKSERVER_CONFIG.MYSITE
    '' ''    MSGDT.Columns.Add(MySite)
    '' ''    For Each Site As KeyValuePair(Of String, String) In _OUTSITEs
    '' ''        Try
    '' ''            Dim EachSite As DataTable = FrameWork.dbObj.GetDT("Select EachDate,TaskRow,MsgBody From Msg2Line_Run Where (EachDate Between '" & NgayThang.DateTime.ToString("yyyy/MM/dd") & "' And '" & NgayThang.DateTime.AddDays(1).ToString("yyyy/MM/dd") & "') Or EachDate='2079-06-06 23:59'", Site.Value)
    '' ''            If EachSite.Rows.Count > 0 Then
    '' ''                Dim ExSite As New DataColumn("Site", GetType(System.String)) : ExSite.DefaultValue = Site.Key
    '' ''                EachSite.Columns.Add(ExSite)
    '' ''                MSGDT.Merge(EachSite, False)
    '' ''            End If
    '' ''        Catch ex As Exception
    '' ''        End Try
    '' ''    Next
    '' ''    '
    '' ''    Return MSGDT
    '' ''    '
    '' ''End Function

    Private Class THREAD_RST
        Private _NgayThang As DateTime
        Public Function GET_RST(ByVal NgayThang As DateTime) As Object()
            _NgayThang = NgayThang
            '
            Dim DS As DataTable = FrameWork.dbObj.GetDT("EXEC PPVIEWER_PROC '" & _NgayThang.ToString("yyyy/MM/dd") & "'")
            Dim MySite As New DataColumn("Site", GetType(System.String)) : MySite.DefaultValue = prjData.LINKSERVER_CONFIG.MYSITE
            DS.Columns.Add(MySite)

            ' '' ''DS.Rows.Clear() '----- limit debug
            '
            Dim _OUTSITEs As Dictionary(Of String, String) = prjData.LINKSERVER_CONFIG.OUTSITEs()
            For Each Site As KeyValuePair(Of String, String) In _OUTSITEs
                Try
                    Dim EachSite As DataTable = FrameWork.dbObj.GetDT("EXEC PPVIEWER_PROC '" & _NgayThang.ToString("yyyy/MM/dd") & "'", Site.Value)
                    If EachSite.Rows.Count > 0 Then
                        Dim ExSite As New DataColumn("Site", GetType(System.String)) : ExSite.DefaultValue = Site.Key
                        EachSite.Columns.Add(ExSite)
                        DS.Merge(EachSite, False)
                    End If
                Catch ex As Exception
                    '
                    prjData.LINKSERVER_CONFIG.BannedSite(Site.Key)
                    '
                End Try
            Next
            '
            Dim _Notes As New DataColumn("Notes", GetType(System.Object))
            DS.Columns.Add(_Notes)
            '

            Dim Re() As Object = New Object() {DS.Copy, Init_AdminMsg(DS, _OUTSITEs).Copy}
            Return Re
            '
        End Function

        Private Function Init_AdminMsg(ByVal GridDS As DataTable, ByVal _OUTSITEs As Dictionary(Of String, String)) As DataTable
            '
            Dim MSGDT As DataTable = FrameWork.dbObj.GetDT("Select EachDate,TaskRow,MsgBody From Msg2Line_Run Where (EachDate Between '" & _NgayThang.ToString("yyyy/MM/dd") & "' And '" & _NgayThang.AddDays(1).ToString("yyyy/MM/dd") & "') Or EachDate='2079-06-06 23:59'")
            Dim MySite As New DataColumn("Site", GetType(System.String)) : MySite.DefaultValue = prjData.LINKSERVER_CONFIG.MYSITE
            MSGDT.Columns.Add(MySite)
            For Each Site As KeyValuePair(Of String, String) In _OUTSITEs
                Try
                    Dim EachSite As DataTable = FrameWork.dbObj.GetDT("Select EachDate,TaskRow,MsgBody From Msg2Line_Run Where (EachDate Between '" & _NgayThang.ToString("yyyy/MM/dd") & "' And '" & _NgayThang.AddDays(1).ToString("yyyy/MM/dd") & "') Or EachDate='2079-06-06 23:59'", Site.Value)
                    If EachSite.Rows.Count > 0 Then
                        Dim ExSite As New DataColumn("Site", GetType(System.String)) : ExSite.DefaultValue = Site.Key
                        EachSite.Columns.Add(ExSite)
                        MSGDT.Merge(EachSite, False)
                    End If
                Catch ex As Exception
                    '
                    prjData.LINKSERVER_CONFIG.BannedSite(Site.Key)
                    '
                End Try
            Next
            '
            Return MSGDT
            '
        End Function
    End Class

    Private Sub Init()
        '
        CrossHairTimer.Tag = Now
        '
        RemoveHandler NgayThang.EditValueChanged, AddressOf NgayThang_EditValueChanged
        TrackingDayChanged.Enabled = False
        '
        gridView1.BeginDataUpdate()
        gridView1.Columns.Clear()
        '
        Dim colUser As New GridColumn()
        gridView1.Columns.Add(colUser)
        'colTotal.Fixed = DevExpress.XtraGrid.Columns.FixedStyle.Right
        colUser.FieldName = "TaskID"
        colUser.Caption = "TASK ID"
        colUser.AppearanceCell.Font = New Font("Arial", 35)
        colUser.AppearanceCell.TextOptions.HAlignment = HorzAlignment.Center
        colUser.AppearanceCell.TextOptions.WordWrap = WordWrap.Wrap
        colUser.Visible = True
        colUser.Width = 400



        Dim DS As DataTable = LOAD_KETQUA(True)
        Dim TuGio As DateTime = NgayThang.DateTime.ToString("yyyy/MM/dd") & " 7:00"
        Dim DenGio As DateTime = NgayThang.DateTime.ToString("yyyy/MM/dd") & " 22:00"
        '
        Dim DT As DataTable = DS.DefaultView.ToTable(True, New String() {"Site", "TaskID", "RowID", "Notes"})
        DT.Columns.Add("LINE", GetType(System.String))
        SortField = ""
        '
        Dim TimeFuture As Boolean = False
        Do While TuGio <= DenGio
            Dim col As New GridColumn()
            gridView1.Columns.Add(col)
            col.FieldName = TuGio.ToString("_HHmm")
            If Not TimeFuture Then
                col.Caption = TuGio.ToString("HH:mm")
            Else
                col.Caption = TuGio.AddHours(-1).ToString("HH:mm")
            End If
            '
            col.Visible = True
            '
            If col.FieldName = Now.AddHours(1).ToString("_HH00") AndAlso NgayThang.DateTime = Now.Date Then
                col.ColumnEdit = customRepositoryItem1
                col.Width = 300
                SortField = col.FieldName
                TimeFuture = True
                col.Visible = True
            Else
                col.Visible = False
            End If

            col.AppearanceCell.TextOptions.HAlignment = HorzAlignment.Center
            col.Tag = TuGio
            '
            DT.Columns.Add(col.FieldName, GetType(System.String))
            '
            If TuGio < DenGio Then
                TuGio = TuGio.AddHours(1)
                If TuGio > DenGio Then
                    TuGio = DenGio
                End If
            Else
                TuGio = TuGio.AddHours(1)
            End If
        Loop
        '
        Dim colTotal As New GridColumn()
        gridView1.Columns.Add(colTotal)
        'colTotal.Fixed = DevExpress.XtraGrid.Columns.FixedStyle.Right
        colTotal.FieldName = "TOTAL"
        colTotal.Caption = "TOTAL"
        colTotal.Visible = True
        colTotal.ColumnEdit = customResTotal
        colTotal.Width = 300
        ''
        DT.Columns.Add("TOTAL", GetType(System.String))
        '

        Dim colNotes As New GridColumn()
        gridView1.Columns.Add(colNotes)
        'colNotes.Fixed = DevExpress.XtraGrid.Columns.FixedStyle.Right
        colNotes.FieldName = "Notes"
        colNotes.Caption = "MESSAGE TO LINE"
        colNotes.Visible = True
        colNotes.Width = 350
        colNotes.AppearanceCell.TextOptions.WordWrap = True
        colNotes.AppearanceCell.Font = New Font("Arial", 10)
        colNotes.ColumnEdit = customResNotes
        ''
        ' '' ''Dim _Notes As New DataColumn("Notes", GetType(System.String))
        ' '' ''DT.Columns.Add(_Notes)
        '
        '
        '
        '
        gridControl1.Dock = DockStyle.None
        gridControl1.Location = New Point(0, GroupBox5.Height)
        gridControl1.Width = Me.Width
        gridControl1.Anchor = AnchorStyles.Left Or AnchorStyles.Right Or AnchorStyles.Top
        gridControl1.SendToBack()
        gridControl1.Height = 30000

        Dim bs As New BindingSource()
        bs.DataSource = DT
        bs.Sort = "Site,TaskID"
        gridControl1.DataSource = bs
        gridControl1.ForceInitialize()
        _helper = New AutoHeightHelper(gridView1)
        _helper.EnableColumnPanelAutoHeight()
        '
        gridView1.EndUpdate()
        '
        '----- loai bo Field KetQua cua DS
        If DS.Columns.Contains("KetQua") Then
            gridControl1.DataSource.DataSource = CountDS(gridControl1.DataSource.DataSource, DS)
        End If
        '
        FullHeightGW()
        '
        ScrollView.Tag = 0
        '
        ScrollView.Enabled = True
        '
        TrackingDayChanged.Enabled = True
        AddHandler NgayThang.EditValueChanged, AddressOf NgayThang_EditValueChanged
        '
    End Sub

    Private Sub AdjustGW_Tick(sender As System.Object, e As System.EventArgs) Handles AdjustGW.Tick
        '
        AdjustGW.Enabled = False
        '
        FullHeightGW()
        '
        If AdjustGW.Tag Mod 2 <> 0 Then
            AdjustGW.Enabled = True
        End If
        '
        AdjustGW.Tag += 1
        '
    End Sub
    Private Sub FullHeightGW()

        Dim intHeight As Int32 = 0
        ' '' ''For Each GridRow As DevExpress.XtraGrid.Views.Grid.GridRow In viewInfo.RowsLoadInfo.ResultRows
        ' '' ''    intHeight += GridRow.TotalHeight
        ' '' ''Next

        Dim viewInfo As GridViewInfo = CType(gridView1.GetViewInfo(), GridViewInfo)
        gridView1.BeginUpdate()
        Dim lft As Integer = gridView1.LeftCoord
        Dim top As Integer = gridView1.TopRowIndex
        gridView1.TopRowIndex = 0
        gridView1.LeftCoord = 0
        Dim rect As New Rectangle(0, 0, Int32.MaxValue, Int32.MaxValue)
        viewInfo.Calc(gridControl1.CreateGraphics(), rect)

        Dim realBounds As Rectangle = viewInfo.Bounds
        viewInfo.Calc(gridControl1.CreateGraphics(), rect)
        For rowIndex As Integer = 0 To viewInfo.RowsInfo.Count - 1
            Dim rowInfo As GridDataRowInfo = CType(viewInfo.RowsInfo(rowIndex), GridDataRowInfo)
            'For colIndex As Integer = 0 To gridView1.Columns.Count - 1
            '    Dim cellInfo As GridCellInfo
            '    If rowInfo IsNot Nothing Then
            '        cellInfo = rowInfo.Cells(gridView1.Columns(colIndex))
            '        viewInfo.UpdateCellAppearance(cellInfo)
            '    End If
            'Next colIndex
            intHeight += rowInfo.Bounds.Height
        Next rowIndex
        viewInfo.Calc(gridControl1.CreateGraphics(), realBounds)

        gridView1.LeftCoord = lft
        gridView1.TopRowIndex = top
        gridView1.EndUpdate()



        '
        Dim TotalH As Integer = Me.ClientSize.Height - GroupBox5.ClientSize.Height

        If intHeight <> 0 Then
            viewInfo.Calc(Nothing, viewInfo.Bounds)
            Dim GroupPanel As Rectangle = viewInfo.ViewRects.GroupPanel
            Dim HeaderH As Rectangle = viewInfo.ViewRects.ColumnPanel
            '
            Dim OldH As Integer = intHeight + HeaderH.Height + GroupPanel.Height + 20
            If OldH > TotalH Then
                TotalH = OldH
            End If
        Else
            gridControl1.Left = 0
            gridControl1.Top = GroupBox5.ClientSize.Height
        End If
        '
        '
        gridControl1.Height = TotalH
        gridView1.LayoutChanged()
        Application.DoEvents()
        '
    End Sub
    Private Function CountDS(ByVal DT As DataTable, ByVal DS As DataTable) As DataTable
        Dim TaskList As List(Of String) = DT.AsEnumerable.Select(Function(fuck) fuck.Field(Of String)("Site") & "|" & fuck.Field(Of String)("TaskID")).ToList
        '---tìm new line ko thuoc DT
        Dim findR As List(Of DataRow) = DS.AsEnumerable.Where(Function(dog) Not TaskList.Contains(dog.Field(Of String)("Site") & "|" & dog.Field(Of String)("TaskID"))).ToList
        For Each Rx As DataRow In findR
            Dim nR As DataRow = DT.NewRow
            nR("TaskID") = Rx("TaskID")
            nR("RowID") = Rx("RowID")
            nR("Site") = Rx("Site")
            DT.Rows.Add(nR)
        Next
        '
        '----- 60 second swith view total column ----------------------
        Dim IsSwithReview As Boolean = False
        If _SwitchReview Mod 2 = 0 Then
            DirectCast(customResTotal.DrawControl, PPInfo).ScaleFont = 1
        Else
            IsSwithReview = True
            DirectCast(customResTotal.DrawControl, PPInfo).ScaleFont = 3
        End If
        '-----------------------------------------------------------
        '
        DisplayComment(DT, Me.Tag(1))
        '
        Dim Total As Integer = 0
        For i As Integer = 0 To DT.Rows.Count - 1
            Dim sR() As DataRow = DS.Select("Site='" & DT.Rows(i)("Site") & "' And TaskID='" & DT.Rows(i)("TaskID") & "'")
            Dim R As DataRow = DT.Rows(i)
            For z As Integer = 0 To sR.Length - 1
                '
                Dim Data As DataTable = prjData.DeserializeObj(sR(z)("KetQua"))
                Dim LastestDone As String = ""
                For k As Integer = 0 To Data.Columns.Count - 1
                    Dim Col As String = Data.Columns(k).ColumnName
                    Dim MonitorCol As String = Microsoft.VisualBasic.Strings.Right(Col, 5)
                    If Col <> "TOTAL" AndAlso Col <> "LINE" Then
                        '
                        Dim MsgInfo As Msg2LineInfo = GetComment(MonitorCol, i)
                        Dim IsMark As String = If(MsgInfo IsNot Nothing, "1", "0")
                        '
                        Dim EachDate As DateTime = PartDateTime(NgayThang.DateTime.Date.ToString("yyyyMMdd" & MonitorCol))
                        If EachDate.Date = NgayThang.DateTime.Date Then
                            If EachDate <= Now.AddHours(1) Then
                                If Data.Rows(1)(Col).ToString <> "" Then
                                    LastestDone = Data.Rows(1)(Col).ToString
                                End If
                                R(MonitorCol) = LastestDone & "|" & Data.Rows(0)(Col).ToString & "|" & IsMark
                            Else
                                R(MonitorCol) = "||" & IsMark
                            End If
                        End If
                    Else
                        If IsSwithReview AndAlso _TotalMonth IsNot Nothing Then
                            R(Col) = "0|0|0"
                            Dim mR() As DataRow = _TotalMonth.Select("[Site]='" & DT.Rows(i)("Site") & "' And TaskID='" & DT.Rows(i)("RowID") & "'")
                            If mR.Length > 0 Then
                                R(Col) = mR(0)("Assign").ToString & "|" & mR(0)("AssignNum") & "|0"
                                Total += mR(0)("Assign")
                            End If
                        Else
                            If IsNumeric(Data.Rows(1)(Col).ToString) Then Total += Data.Rows(1)(Col).ToString
                            R(Col) = Data.Rows(1)(Col).ToString & "|" & Data.Rows(0)(Col).ToString & "|0"
                        End If
                    End If
                    '
                    Dim uR() As DataRow = _LINENAME.Select("Site='" & DT.Rows(i)("Site") & "' And UserID='" & sR(z)("UserID") & "'")
                    If uR.Length > 0 Then
                        DT.Rows(i)("LINE") = uR(0)("UserName")
                    End If
                    '
                    '
                Next
                '
            Next
        Next
        '
        GroupBox5.Tag = Total
        '
        Return DT
        '
    End Function
    Private Function PartDateTime(ByVal FieldName As String) As DateTime
        Return New Date(Microsoft.VisualBasic.Strings.Left(FieldName, 4), Microsoft.VisualBasic.Strings.Mid(FieldName, 5, 2), Microsoft.VisualBasic.Strings.Mid(FieldName, 7, 2), Microsoft.VisualBasic.Strings.Mid(FieldName, 10, 2), 0, 0)
    End Function

    Private Sub gridView1_CustomDrawCell(sender As Object, e As DevExpress.XtraGrid.Views.Base.RowCellCustomDrawEventArgs) Handles gridView1.CustomDrawCell
        If e.RowHandle > -1 Then
            '
            If e.Column.FieldName = "TaskID" Then

            ElseIf e.Column.FieldName = "Notes" Then
                DirectCast(e.Column.ColumnEdit, CustomCode.CustomControlInGrid.CustomRepositoryItem).DrawControl.BackColor = e.Appearance.BackColor
            ElseIf Not IsDBNull(e.CellValue) Then
                If e.Column.ColumnEdit IsNot Nothing Then
                    '
                Else
                    Dim Data() As String = Microsoft.VisualBasic.Strings.Split(e.CellValue.ToString, "|")
                    If Data(2) = "1" AndAlso e.Column.ColumnEdit Is Nothing Then '--- Comment mark
                        Dim triangle() As Point = {New Point(e.Bounds.Right, e.Bounds.Top), New Point(e.Bounds.Right, e.Bounds.Top + 12), New Point(e.Bounds.Right - 12, e.Bounds.Top)}
                        e.Graphics.DrawPolygon(New Pen(Color.Orange), triangle)
                        e.Graphics.FillPolygon(New SolidBrush(Color.Orange), triangle)
                    End If
                    '
                    Dim _Done As Integer = 0
                    Dim _Plan As Integer = 0
                    Dim _Total As Integer = 0
                    If Data.Length = 3 AndAlso IsNumeric(Data(0)) Then
                        _Done = Data(0)
                        _Plan = Data(1)
                        _Total = _Done - _Plan
                        If _Total > 0 Then
                            e.Appearance.ForeColor = Color.FromArgb(102, 204, 255) ' Color.Blue
                            e.DisplayText = "+" & _Total
                        ElseIf _Total = 0 Then
                            e.Appearance.ForeColor = Color.FromArgb(255, 255, 0) ' yellow
                            e.DisplayText = _Total
                        Else
                            e.Appearance.ForeColor = Color.FromArgb(255, 0, 255) ' Color.Red
                            e.DisplayText = _Total
                        End If
                        '
                        Return
                        '
                    End If
                End If
                '
                e.Appearance.ForeColor = Color.FromArgb(255, 255, 0) ' Color.Black
                e.DisplayText = ""
                '
            Else
                If e.Column.ColumnEdit IsNot Nothing Then
                    e.Handled = True
                End If
            End If
        End If
    End Sub
    Private Sub gridView1_CustomDrawRowIndicator(ByVal sender As Object, ByVal e As DevExpress.XtraGrid.Views.Grid.RowIndicatorCustomDrawEventArgs) Handles gridView1.CustomDrawRowIndicator
        Dim rowIndex As Integer = e.RowHandle
        If rowIndex >= 0 Then
            '
            Dim R As DataRow = gridView1.GetDataRow(rowIndex)

            'e.Info.Appearance.TextOptions.HAlignment = DevExpress.Utils.HorzAlignment.Far
            If R("Site") <> "HVC" Then
                e.Info.Appearance.Font = New Font(e.Appearance.Font.FontFamily, 25, FontStyle.Italic Or FontStyle.Underline)
            Else
                e.Info.Appearance.Font = New Font(e.Appearance.Font.FontFamily, 25)
            End If

            e.Info.DisplayText = R("LINE").ToString.Trim & " /" & R("Site").ToString.Trim.ToLower 'Strings.Left(R("Site").ToString.Trim, 1)

            'e.Appearance.FillRectangle(e.Cache, e.Bounds)
            'e.Graphics.DrawString(e.Info.DisplayText, New Font(e.Appearance.Font.FontFamily, 20),
            '   e.Appearance.GetForeBrush(e.Cache), e.Bounds)

            'Dim propertyInfo As Reflection.PropertyInfo = GetType(DevExpress.XtraGrid.Views.Base.BaseView).GetProperty("Painter", BindingFlags.Instance Or BindingFlags.NonPublic)
            'If propertyInfo IsNot Nothing Then
            '    Dim painter As DevExpress.XtraGrid.Views.Grid.Drawing.GridPainter = TryCast(propertyInfo.GetValue(Me.gridView1, Nothing), DevExpress.XtraGrid.Views.Grid.Drawing.GridPainter)
            '    If painter IsNot Nothing Then
            '        Dim ci As New DevExpress.XtraGrid.Drawing.GridFooterCellInfoArgs()
            '        ci.DisplayText = gridView1.GetDataRow(rowIndex)("TaskID")
            '        ci.Bounds = e.Bounds
            '        Dim cache As New DevExpress.Utils.Drawing.GraphicsCache(e.Graphics)
            '        ci.Cache = cache
            '        ci.Appearance.Assign(gridView1.PaintAppearance.FooterPanel)
            '        painter.ElementsPainter.FooterCell.CalcObjectBounds(ci)
            '        Dim caption As String = ci.DisplayText
            '        ci.DisplayText = ""
            '        Dim r As Rectangle = ci.Bounds
            '        r.Inflate(-2, 0)
            '        painter.ElementsPainter.FooterPanel.DrawObject(ci)
            '        painter.ElementsPainter.FooterCell.DrawObject(ci)
            '        ci.Appearance.DrawString(cache, caption, r)
            '        e.Handled = True
            '        cache.Dispose()
            '    End If


            'End If
            'e.Handled = True
        End If

        '
        'e.Info.ImageIndex = -1
    End Sub

    Private Sub GroupBox5_Paint(sender As Object, e As System.Windows.Forms.PaintEventArgs) Handles GroupBox5.Paint
        Dim propertyInfo As PropertyInfo = GetType(DevExpress.XtraGrid.Views.Base.BaseView).GetProperty("Painter", BindingFlags.Instance Or BindingFlags.NonPublic)
        If propertyInfo IsNot Nothing Then
            Dim painter As DevExpress.XtraGrid.Views.Grid.Drawing.GridPainter = TryCast(propertyInfo.GetValue(Me.gridView1, Nothing), DevExpress.XtraGrid.Views.Grid.Drawing.GridPainter)
            If painter IsNot Nothing Then
                Dim vi As DevExpress.XtraGrid.Views.Grid.ViewInfo.GridViewInfo = TryCast(Me.gridView1.GetViewInfo(), DevExpress.XtraGrid.Views.Grid.ViewInfo.GridViewInfo)
                '
                Dim IsClockPos As Boolean = False
                Dim yOffset As Integer = 31
                For Each column As GridColumn In Me.gridView1.Columns
                    If vi.ColumnsInfo(column) IsNot Nothing Then
                        Dim columnBounds As Rectangle = vi.ColumnsInfo(column).Bounds
                        If CDate(column.Tag).ToString("yyyyMMdd_HH00") = Now.AddHours(1).ToString("yyyyMMdd_HH00") Then
                            DigitalDisplayControl1.Location = New Point(columnBounds.X, 0)
                            DigitalDisplayControl1.Width = columnBounds.Width - 2
                            DigitalDisplayControl1.Tag = "1"
                            IsClockPos = True
                        Else
                            '
                            Dim cache As New DevExpress.Utils.Drawing.GraphicsCache(e.Graphics)
                            Dim ci As New DevExpress.XtraGrid.Drawing.GridFooterCellInfoArgs()
                            ci.Appearance.Assign(gridView1.PaintAppearance.HeaderPanel)
                            '
                            Dim Caption As String = column.Caption
                            If column.FieldName = "TOTAL" Then
                                Caption = GroupBox5.Tag
                                columnBounds.Height += yOffset
                                ci.Appearance.Font = New Font("Arial", 35) ', FontStyle.Bold)
                            ElseIf column.FieldName = "TaskID" Then
                                columnBounds.Height += yOffset
                                ci.Appearance.TextOptions.HAlignment = HorzAlignment.Near
                                ci.Appearance.Font = New Font("Arial", 30) ', FontStyle.Bold)
                                Caption = Caption

                                'Dim columnBounds1 As Rectangle = New Rectangle(0, columnBounds.Y, 200, columnBounds.Height)
                                'Dim cache1 As New DevExpress.Utils.Drawing.GraphicsCache(e.Graphics)
                                'Dim ci1 As New DevExpress.XtraGrid.Drawing.GridFooterCellInfoArgs()
                                'ci1.Appearance.Assign(gridView1.PaintAppearance.HeaderPanel)
                                ''
                                'ci1.Bounds = columnBounds1
                                'ci1.Cache = cache1
                                'painter.ElementsPainter.FooterCell.CalcObjectBounds(ci1)
                                ''
                                ''ci1.DisplayText = ""
                                'Dim r1 As Rectangle = ci1.Bounds
                                'r1.Inflate(-2, 0)
                                'painter.ElementsPainter.FooterPanel.DrawObject(ci1)
                                'painter.ElementsPainter.FooterCell.DrawObject(ci1)

                                'ci1.Appearance.DrawString(cache1, Caption, r1)

                                'cache1.Dispose()
                            Else
                                columnBounds.Y += yOffset
                            End If
                            '
                            ci.Bounds = columnBounds
                            ci.Cache = cache
                            painter.ElementsPainter.FooterCell.CalcObjectBounds(ci)
                            '
                            'ci.DisplayText = ""
                            Dim r As Rectangle = ci.Bounds
                            r.Inflate(-2, 0)
                            painter.ElementsPainter.FooterPanel.DrawObject(ci)
                            painter.ElementsPainter.FooterCell.DrawObject(ci)

                            ci.Appearance.DrawString(cache, Caption, r)

                            cache.Dispose()
                        End If

                    End If
                Next
                '
                If Not IsClockPos Then
                    DigitalDisplayControl1.Location = New Point(Me.Width - DigitalDisplayControl1.Width - 2, 0)
                    DigitalDisplayControl1.Anchor = AnchorStyles.Top Or AnchorStyles.Right
                    DigitalDisplayControl1.Tag = "0"
                End If
                '
                Update_CrossHair()
                '
            End If
        End If
        e.Graphics.DrawLine(Pens.Black, New Point(0, GroupBox5.Height - 1), New Point(GroupBox5.Width, GroupBox5.Height - 1))
    End Sub

    Private Sub REAL_DATA()
        '
        Try
            Dim DS As DataTable = LOAD_KETQUA(False)
            REAL_DATA(DS)
        Catch ex As Exception
            Label1.Text = "REAL_DATA: " & ex.Message.ToString
        End Try
    End Sub
    Private Sub REAL_DATA(ByVal DS As DataTable)
        If DS.Columns.Contains("KetQua") Then
            Dim bkCount As Integer = gridControl1.DataSource.DataSource.Rows.Count
            gridControl1.DataSource.DataSource = CountDS(gridControl1.DataSource.DataSource, DS)
            '
            If _IsTVMode Then
                If bkCount <> gridControl1.DataSource.DataSource.Rows.Count Then
                    FullHeightGW()
                    AdjustGW.Tag = 1
                    AdjustGW.Enabled = True
                Else
                    gridView1.LayoutChanged()
                End If
            Else
                gridView1.LayoutChanged()
            End If
        End If
        '
        If CDate(CrossHairTimer.Tag).ToString("yyyyMMdd_HH00") <> Now.ToString("yyyyMMdd_HH00") Then
            Dim CurCol As GridColumn = gridView1.Columns(Now.ToString("_HH00"))
            If CurCol IsNot Nothing Then
                CurCol.ColumnEdit = Nothing : CurCol.Width = 75
                CurCol.Visible = False
            End If
            CurCol = gridView1.Columns(Now.AddHours(1).ToString("_HH00"))
            If CurCol IsNot Nothing Then
                CurCol.ColumnEdit = customRepositoryItem1 : CurCol.Width = 300
                CurCol.Visible = True
                CurCol.VisibleIndex = 1
            End If
        End If
        '
        GroupBox5.Refresh()
        '
    End Sub

    Private Sub gridView1_LeftCoordChanged(sender As Object, e As System.EventArgs) Handles gridView1.LeftCoordChanged
        GroupBox5.Refresh()
    End Sub

    Private Sub gridView1_MouseDown(ByVal sender As Object, ByVal e As System.Windows.Forms.MouseEventArgs) Handles gridView1.MouseDown
        If Not _IsTVMode Then
            If e.Button = Windows.Forms.MouseButtons.Right Then
                Dim hi As DevExpress.XtraGrid.Views.Grid.ViewInfo.GridHitInfo = gridView1.CalcHitInfo(New Point(e.X, e.Y))
                Dim OnRowCell As Boolean = ShowHitInfo(hi)
                If OnRowCell AndAlso hi.Column IsNot Nothing AndAlso hi.Column.FieldName <> "TOTAL" AndAlso hi.Column.FieldName <> "Notes" AndAlso hi.Column.FieldName <> "LINE" Then
                    btnMessageToLine.Tag = e.Location
                    btnMessageToLine.Enabled = True
                Else
                    btnMessageToLine.Tag = Nothing
                    btnMessageToLine.Enabled = False
                End If
                PopupMenu2.ShowPopup(Control.MousePosition)
            End If
        End If
    End Sub
    Private Function ShowHitInfo(ByVal hi As DevExpress.XtraGrid.Views.Grid.ViewInfo.GridHitInfo) As Boolean
        If hi.InRow Or hi.InRowCell Then Return True
    End Function

#End Region

#Region "TEST ONLY"

    'Private Sub Form1_MouseMoveDrawing(ByVal sender As Object, ByVal e As System.Windows.Forms.MouseEventArgs) Handles Me.MouseMove

    '    Dim g As Graphics = Me.CreateGraphics()
    '    g.Clear(Nothing)
    '    graph_sizes()
    '    g.DrawLine(Pens.Blue, x1, e.Y, x2, e.Y)  'draw horizontal line

    '    g.DrawLine(Pens.Red, e.X, y1, e.X, y2)   'draw vertical line

    '    'Draw_cross_hair_lines(g)
    'End Sub
    'Dim cursor_x, cursor_y As Decimal
    'Dim x1, y1, x2, y2 As Decimal
    'Dim std_width, std_height, std_x, std_y, old_x, old_y As Decimal
    'Dim balls As Integer

    'Private Sub graph_sizes()

    '    std_width = Me.ClientSize.Width * 0.9       'width of the main rectangle

    '    std_height = Me.ClientSize.Height * 0.9     'height of the main rectangle

    '    std_x = Me.ClientSize.Width * 0.01          'x cord of the main rectangle

    '    std_y = Me.ClientSize.Height * 0.01         'y cord of the main rectangle

    '    x1 = std_x

    '    x2 = std_x + std_width

    '    y1 = std_y

    '    y2 = std_y + std_height

    'End Sub
    'Private Sub Draw_cross_hair_lines(ByVal g As Graphics)
    '    'draw the rectangle
    '    g.DrawRectangle(Pens.Black, std_x, std_y, std_width, std_height)
    'End Sub

#End Region

    Private Sub ViewProductionStatus_ItemClick(sender As Object, e As DevExpress.XtraBars.ItemClickEventArgs) Handles ViewProductionStatus.ItemClick
        Dim _TVFrm As DevExpress.XtraEditors.XtraForm = Nothing
        _TVFrm = BuildTVFrm()
        _TVFrm.Show()
        _TVFrm.WindowState = FormWindowState.Maximized
        _TVFrm.TopMost = True
        '_TVFrm.Size = New Size(1920, 600)
        '_TVFrm.Location = New Point(0, 0)
    End Sub

    Private _src As _ProductionPlaning_Dialy1
    Private Sub displayTV_ItemClick(sender As System.Object, e As DevExpress.XtraBars.ItemClickEventArgs) Handles displayTV.ItemClick
        Dim _TVFrm As DevExpress.XtraEditors.XtraForm = Nothing
        Dim SearchRst As Integer = DetectIfMonitorsExtendedMode() ' DisplayChanger.Start()
        If SearchRst > 1 Then
            Dim RstExtendTV As Long = New TVmonitor().ExtendDisplays()
            Do While SearchRst > Screen.AllScreens.Length
                System.Threading.Thread.Sleep(500)
                Application.DoEvents()
            Loop

            If SearchRst > 1 Then
                _TVFrm = BuildTVFrm()
                _TVFrm.TopMost = True
                _TVFrm.Show()
                TVmonitor.ExtendMonitor(_TVFrm.Handle, 1)
                _TVFrm.WindowState = FormWindowState.Maximized
                FullHeightGW()
            End If
        End If
        '
    End Sub
    Private Function BuildTVFrm() As DevExpress.XtraEditors.XtraForm
        _src = New _ProductionPlaning_Dialy1
        _src.IsTVMode = True
        _src.WS = Me
        _src.Dock = DockStyle.Fill
        '
        Dim _TVFrm As New DevExpress.XtraEditors.XtraForm
        _TVFrm.AutoScaleMode = System.Windows.Forms.AutoScaleMode.None
        _TVFrm.FormBorderStyle = System.Windows.Forms.FormBorderStyle.Fixed3D
        _TVFrm.ControlBox = False
        _TVFrm.Name = "TVProduction"
        _TVFrm.ShowIcon = False
        _TVFrm.ShowInTaskbar = False
        _TVFrm.Controls.Add(_src)
        '
        extendTV.Visible = True
        displayTV.Enabled = False
        ViewProductionStatus.Enabled = False
        '
        Return _TVFrm
    End Function
    Private Function DetectIfMonitorsExtendedMode() As Integer
        Dim result As Boolean = False
        Dim search As New ManagementObjectSearcher("root\CIMV2", "SELECT * FROM Win32_PnPEntity WHERE SERVICE = 'monitor'")
        Return search.Get().Count
    End Function
    Private Sub extendTV_Click(sender As System.Object, e As System.EventArgs) Handles extendTV.Click
        If _src IsNot Nothing AndAlso Not _src.IsDisposed Then
            _src.FindForm.Close()
        End If
        '
        _src = Nothing
        extendTV.Visible = False
        displayTV.Enabled = True
        ViewProductionStatus.Enabled = True
        '
        Call New TVmonitor().ExternalDisplay()
        '
    End Sub

#Region "COMMENT"
    Private Sub popupControlContainer1_CloseUp(sender As Object, e As System.EventArgs) Handles popupControlContainer1.CloseUp
        TransparentPictureBox1.Visible = False
    End Sub
    Private Sub btnResetMsg_Click(sender As System.Object, e As System.EventArgs) Handles btnResetMsg.Click
        Dim MsgInfo As Msg2LineInfo = GetComment(gridView1.FocusedColumn.FieldName, gridView1.GetFocusedDataSourceRowIndex())
        If MsgInfo IsNot Nothing Then
            TransparentPictureBox1.Visible = False
            comments.Remove(New CommentCoordinates(gridView1.GetFocusedDataSourceRowIndex(), gridView1.FocusedColumn.FieldName))
            '
            Dim fR As DataRow = gridView1.GetFocusedDataRow
            Dim OldVal() As String = Strings.Split(fR(gridView1.FocusedColumn.FieldName), "|")
            OldVal(2) = "0"
            fR(gridView1.FocusedColumn.FieldName) = Strings.Join(OldVal, "|")
            '
            '
            Dim EachDate As String = CDate(MsgInfo.StartValid).AddHours(1).ToString("yyyy/MM/dd HH:mm")  'MsgInfo.StartValid sẽ nhỏ hơn 1 giờ so với Column Field .....
            Dim TargetSite As String = prjData.ConnectString
            If fR("Site").ToString <> prjData.LINKSERVER_CONFIG.MYSITE Then
                If prjData.SERVERLINKs.ContainsKey(fR("Site").ToString) Then TargetSite = prjData.SERVERLINKs(fR("Site").ToString)
            End If
            If TargetSite.Length > 0 Then
                Call FrameWork.dbObj.Execuite_NonQuery("Delete From Msg2Line_Run Where EachDate='" & EachDate & "' And TaskRow='" & fR("RowID") & "'", False, TargetSite)
            End If
            '
            gridView1.RefreshRowCell(gridView1.GetFocusedDataSourceRowIndex(), gridView1.FocusedColumn)
            TransparentPictureBox1.Visible = True
        End If
    End Sub
    Private Sub btnMsgTextOK_Click(sender As System.Object, e As System.EventArgs) Handles btnMsgTextOK.Click
        Dim MsgInfo As Msg2LineInfo = GetComment(gridView1.FocusedColumn.FieldName, gridView1.GetFocusedDataSourceRowIndex())
        Dim StartTime As DateTime = CDate(Now.ToString("yyyy/MM/dd ") & Microsoft.VisualBasic.Strings.Mid(gridView1.FocusedColumn.FieldName, 2, 2) & ":00")
        If MsgInfo Is Nothing Then
            Dim coordinates As New CommentCoordinates(gridView1.GetFocusedDataSourceRowIndex(), gridView1.FocusedColumn.FieldName)
            MsgInfo = New Msg2LineInfo()
            comments(coordinates) = MsgInfo
            MsgInfo.StartValid = StartTime.AddHours(-1).ToString("yyyy/MM/dd HH:00")
        End If
        '
        MsgInfo.MsgText = MsgText.Text
        MsgInfo.MsgColor = MsgColor.Color.R & "," & MsgColor.Color.G & "," & MsgColor.Color.B
        MsgInfo.AdminID = FrameWork.UserID
        MsgInfo.IconID = ImageComboBoxEdit1.SelectedIndex
        '
        If MsgValid2Time.Checked Then
            MsgInfo.Valid2Time = Now.ToString("yyyy/MM/dd") & CDate(MsgValidTime.EditValue).ToString(" HH:mm")
        Else
            MsgInfo.Valid2Time = ""
        End If
        '
        MsgInfo.AdminSite = prjData.LINKSERVER_CONFIG.MYSITE
        '
        '
        Dim SaveText As String = New JavaScriptSerializer().Serialize(MsgInfo)
        Dim EachDate As String = StartTime.ToString("yyyy/MM/dd HH:mm")
        Dim fR As DataRow = gridView1.GetFocusedDataRow
        Dim OldVal() As String = Strings.Split(fR(gridView1.FocusedColumn.FieldName), "|")
        OldVal(2) = "1"
        fR(gridView1.FocusedColumn.FieldName) = Strings.Join(OldVal, "|")
        '
        '
        Dim TargetSite As String = prjData.ConnectString
        If fR("Site").ToString <> prjData.LINKSERVER_CONFIG.MYSITE Then
            If prjData.SERVERLINKs.ContainsKey(fR("Site").ToString) Then TargetSite = prjData.SERVERLINKs(fR("Site").ToString)
        End If
        If TargetSite.Length > 0 Then
            Call FrameWork.dbObj.Execuite_NonQuery("Delete From Msg2Line_Run Where EachDate='" & EachDate & "' And TaskRow='" & fR("RowID") & "'" & vbCrLf & _
                                                   "; Insert Into Msg2Line_Run Select '" & EachDate & "',N'" & SaveText & "','" & fR("RowID") & "'", False, TargetSite)
        End If
        '
        popupControlContainer1.HidePopup()
        GroupBox5.Refresh()
    End Sub
    Private Sub MsgColor_EditValueChanged(sender As System.Object, e As System.EventArgs) Handles MsgColor.EditValueChanged
        MsgText.ForeColor = MsgColor.EditValue
        MsgText.BackColor = ContractColor.IdealTextColor(MsgText.ForeColor)
    End Sub
    Private Sub Init_EmotionIcon()
        If ImageComboBoxEdit1.Properties.Items.Count = 0 Then
            Dim imgCollection As New ImageCollection()
            imgCollection.ImageSize = New Size(32, 32)
            imgCollection.Images.AddRange(ContractColor.dogIcon)
            ImageComboBoxEdit1.Properties.SmallImages = imgCollection
            For i As Integer = 0 To imgCollection.Images.Count - 1
                ImageComboBoxEdit1.Properties.Items.Add(New DevExpress.XtraEditors.Controls.ImageComboBoxItem(i))
            Next
            '
            toolTipController1.ImageList = imgCollection
        End If
    End Sub
    Private Sub btnMessageToLine_ItemClick(sender As System.Object, e As DevExpress.XtraBars.ItemClickEventArgs) Handles btnMessageToLine.ItemClick
        Init_EmotionIcon()
        '
        Dim info As GridViewInfo = DirectCast(gridView1.GetViewInfo(), GridViewInfo)
        Dim cell As GridCellInfo = info.GetGridCellInfo(gridView1.GetFocusedDataSourceRowIndex(), gridView1.FocusedColumn.AbsoluteIndex)
        TransparentPictureBox1.Bounds = cell.Bounds
        TransparentPictureBox1.Location = New Point(cell.Bounds.Left + gridControl1.Left, cell.Bounds.Top + gridControl1.Top)
        TransparentPictureBox1.Visible = True
        '
        Dim MsgInfo As Msg2LineInfo = GetComment(gridView1.FocusedColumn.FieldName, gridView1.GetFocusedDataSourceRowIndex())
        If MsgInfo Is Nothing Then
            btnResetMsg.Visible = False
            popupControlContainer1.Tag = Nothing
        Else
            popupControlContainer1.Tag = MsgInfo
            MsgText.Text = MsgInfo.MsgText
            MsgColor.EditValue = DirectCast(New ColorConverter().ConvertFromString(MsgInfo.MsgColor), Color)
            MsgText.ForeColor = MsgColor.EditValue
            ImageComboBoxEdit1.SelectedIndex = MsgInfo.IconID
            '
            MsgValid2Time.Tag = "FUCK"
            If MsgInfo.Valid2Time <> Nothing Then
                MsgValid2Time.Checked = True
                MsgValidTime.EditValue = MsgInfo.Valid2Time
                MsgValidTime.Visible = True
            Else
                MsgValid2Time.Checked = False
                MsgValidTime.EditValue = Nothing
                MsgValidTime.Visible = False
            End If
            MsgValid2Time.Tag = Nothing
            '
            btnResetMsg.Visible = True
        End If
        popupControlContainer1.ShowPopup(gridControl1.PointToScreen(New Point(cell.Bounds.Left + cell.Bounds.Width / 2, cell.Bounds.Top + cell.Bounds.Height - 10)))
        'popupControlContainer1.ShowPopup(gridControl1.PointToScreen(CType(e.Item.Tag, Point)))
        MsgText.Focus()
    End Sub

    Public comments As New Dictionary(Of CommentCoordinates, Msg2LineInfo)
    Private Function ContainsComment(ByVal columnName As String, ByVal rowIndex As Integer) As Boolean
        Return comments.ContainsKey(New CommentCoordinates(rowIndex, columnName))
    End Function
    Private Function GetComment(ByVal columnName As String, ByVal rowIndex As Integer) As Msg2LineInfo
        Dim coordinates As New CommentCoordinates(rowIndex, columnName)
        If comments.ContainsKey(coordinates) Then
            Return comments(coordinates)
        Else
            Return Nothing
        End If
    End Function

    Private Sub toolTipController1_GetActiveObjectInfo(ByVal sender As Object, ByVal e As DevExpress.Utils.ToolTipControllerGetActiveObjectInfoEventArgs) Handles toolTipController1.GetActiveObjectInfo
        If e.Info IsNot Nothing OrElse TransparentPictureBox1.Visible Then
            Return
        End If
        Dim columnName As String = String.Empty
        Dim dataSourceRowIndex As Integer = -1, rowHandle As Integer = -1
        If e.SelectedControl Is gridControl1 Then
            Dim info As GridHitInfo = gridView1.CalcHitInfo(e.ControlMousePosition)
            If info.InRowCell Then
                columnName = info.Column.FieldName
                dataSourceRowIndex = gridView1.GetDataSourceRowIndex(info.RowHandle)
                rowHandle = info.RowHandle
            End If
        ElseIf TypeOf e.SelectedControl Is BaseEdit AndAlso gridView1.ActiveEditor.Equals(e.SelectedControl) Then
            columnName = gridView1.FocusedColumn.FieldName
            dataSourceRowIndex = gridView1.GetFocusedDataSourceRowIndex()
            rowHandle = gridView1.FocusedRowHandle
        End If
        If columnName <> String.Empty Then
            Dim MsgInfo As Msg2LineInfo = GetComment(columnName, dataSourceRowIndex)
            If MsgInfo IsNot Nothing Then
                Dim text As String = "<color=" & MsgInfo.MsgColor & ">" & MsgInfo.MsgText & "</color>"
                Dim cellKey As String = String.Format("{0}-{1}", rowHandle, columnName)
                e.Info = New DevExpress.Utils.ToolTipControlInfo(cellKey, text)
                '
                Dim sTooltip As SuperToolTip = New SuperToolTip()
                Dim args As New SuperToolTipSetupArgs()
                Dim R As DataRow = FrameWork.userR.Table.AsEnumerable.Where(Function(dog) dog.Field(Of Integer)("UserID") = MsgInfo.AdminID).FirstOrDefault
                If R IsNot Nothing Then
                    args.Title.Text = R("UserName") & " send Message 2 line ..."
                Else
                    args.Title.Text = "(Unkwnow)" & " send Message 2 line ..."
                End If
                '
                If MsgInfo.IconID <> -1 Then args.Contents.Image = DirectCast(ImageComboBoxEdit1.Properties.SmallImages, DevExpress.Utils.ImageCollection).Images(MsgInfo.IconID)
                args.Contents.Text = text
                'e.Info.ToolTipImage =
                args.ShowFooterSeparator = True
                '
                Dim EndTime As String = "no end time"
                If MsgInfo.Valid2Time <> "" Then EndTime = "will end at: " & CDate(MsgInfo.Valid2Time).ToString("HH:mm")
                args.Footer.Text = "Status: active at " & CDate(MsgInfo.StartValid).ToString("HH:mm") & " - " & EndTime
                sTooltip.Setup(args)
                ' Enable HTML Text Formatting for the created SuperToolTip:
                sTooltip.AllowHtmlText = DefaultBoolean.[True]
                '
                e.Info.SuperTip = sTooltip
            End If
        End If
    End Sub

    Public Structure CommentCoordinates
        Public Sub New(ByVal rowIndex As Integer, ByVal columnName As String)
            Me.RowIndex = rowIndex
            Me.ColumnName = columnName
        End Sub
        Public RowIndex As Integer
        Public ColumnName As String
    End Structure
    Private Sub MsgValid2Time_CheckedChanged(sender As System.Object, e As System.EventArgs) Handles MsgValid2Time.CheckedChanged
        If MsgValid2Time.Tag Is Nothing Then
            MsgValidTime.Visible = MsgValid2Time.Checked
            If MsgValidTime.Visible Then
                Dim Valid2 As DateTime = CDate(Now.ToString("yyyy/MM/dd ") & Microsoft.VisualBasic.Strings.Mid(gridView1.FocusedColumn.FieldName, 2, 2) & ":00")
                If popupControlContainer1.Tag Is Nothing Then '----new
                    If MsgValidTime.EditValue = Nothing OrElse MsgValidTime.EditValue < Valid2 Then
                        MsgValidTime.EditValue = Valid2
                    End If
                ElseIf MsgValidTime.EditValue = Nothing Then
                    MsgValidTime.EditValue = Valid2
                End If
            End If
        End If
    End Sub

#End Region

    Private Sub RefreshView_ItemClick(sender As System.Object, e As DevExpress.XtraBars.ItemClickEventArgs) Handles RefreshView.ItemClick
        '
        Dim MySite As String = prjData.LINKSERVER_CONFIG.MYSITE
        Dim str As String = "Select TaskID,Sum(SumPlanning) As AssignNum,Sum(SumDone) As Assign From sum_donesx Where EachDate='" & Now.ToString("yyyy/MM/01") & "' Group By TaskID"
        _TotalMonth = FrameWork.dbObj.GetDT(str)
        Dim myColSite As New DataColumn("Site", GetType(System.String)) : myColSite.DefaultValue = MySite : _TotalMonth.Columns.Add(myColSite)
        '
        _LINENAME = FrameWork.dbObj.GetDT("Select UserID,UserName From Users")
        Dim myUser As New DataColumn("Site", GetType(System.String)) : myUser.DefaultValue = MySite : _LINENAME.Columns.Add(myUser)
        '
        '
        '
        Dim _OUTSITEs As Dictionary(Of String, String) = prjData.LINKSERVER_CONFIG.OUTSITEs()
        For Each Site As KeyValuePair(Of String, String) In _OUTSITEs
            Try
                Dim EachSite As DataTable = FrameWork.dbObj.GetDT(str, Site.Value)
                If EachSite.Rows.Count > 0 Then
                    Dim ExSite As New DataColumn("Site", GetType(System.String)) : ExSite.DefaultValue = Site.Key
                    EachSite.Columns.Add(ExSite)
                    _TotalMonth.Merge(EachSite, False)
                End If
            Catch ex As Exception
                '
                prjData.LINKSERVER_CONFIG.BannedSite(Site.Key)
                '
            End Try

            Try
                Dim EachSite As DataTable = FrameWork.dbObj.GetDT("Select UserID,UserName From Users", Site.Value)
                If EachSite.Rows.Count > 0 Then
                    Dim ExSite As New DataColumn("Site", GetType(System.String)) : ExSite.DefaultValue = Site.Key
                    EachSite.Columns.Add(ExSite)
                    _LINENAME.Merge(EachSite, False)
                End If
            Catch ex As Exception
                '
                prjData.LINKSERVER_CONFIG.BannedSite(Site.Key)
                '
            End Try


        Next
        '
        '

        '
        TemplateMsg.Properties.Items.Clear()
        Dim DT As DataTable = FrameWork.dbObj.GetDT("Select * From Msg2Line Where HuyBo=1 Order By OrderID")
        For i As Integer = 0 To DT.Rows.Count - 1
            Dim EachMsg As New Msg2LineInfo() With {.MsgText = DT.Rows(i)("MsgText"),
                                                    .MsgColor = DT.Rows(i)("MsgColor"),
                                                    .IconID = DT.Rows(i)("IconID")}
            TemplateMsg.Properties.Items.Add(EachMsg)
        Next
    End Sub

    Private Sub Label2_Click(sender As System.Object, e As System.EventArgs) Handles Label2.Click
        ImageComboBoxEdit1.SelectedIndex = -1
    End Sub
    '
    Private Sub TemplateMsg_SelectedIndexChanged(sender As System.Object, e As System.EventArgs) Handles TemplateMsg.SelectedIndexChanged
        Dim EachMsg As Msg2LineInfo = TemplateMsg.SelectedItem
        MsgText.EditValue = EachMsg.MsgText
        MsgColor.EditValue = DirectCast(New ColorConverter().ConvertFromString(EachMsg.MsgColor), Color)
        ImageComboBoxEdit1.SelectedIndex = EachMsg.IconID
    End Sub


End Class

